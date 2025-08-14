using AutoMapper;
using Common.Dto;
using Microsoft.AspNetCore.Http;
using Reposetory.Entities;
using Repository.Interfacese;
using Repository.Repositories;
using Service.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Service.Services
{
    public class CallService : IService<CallsDto>, ICallService
    {
        private readonly IRepository<Calls> repository;
        private readonly ICallsRepository _Callrepository;
        private readonly IMapper mapper;
        private readonly IVolunteersCallLogic _volunteerCallLogic;
        private readonly Func<IVolunteersCallLogic> logicFactory;
        private readonly IHttpContextAccessor _httpContextAccessor;

        private IVolunteersCallLogic Logic => logicFactory();

        public CallService(IRepository<Calls> repository, ICallsRepository Callrepository, IMapper mapper, IVolunteersCallLogic volunteerCallLogic, Func<IVolunteersCallLogic> logicFactory, IHttpContextAccessor httpContextAccessor)
        {
            this._Callrepository = Callrepository;
            this.repository = repository;
            this.mapper = mapper;
            _volunteerCallLogic = volunteerCallLogic;
            this.logicFactory = logicFactory;
            _httpContextAccessor = httpContextAccessor;
        }
        public async Task<CallsDto> AddItemAsync(CallsDto item)
        {

            var entity = mapper.Map<Calls>(item);
            var added = await repository.AddItem(entity);
            return mapper.Map<CallsDto>(added);
        }
        public async Task DeleteItemAsync(int id)
        {
            var call = await repository.GetById(id);
            if (call == null)
                throw new System.Exception("קריאה לא נמצאה");

            await repository.DeleteItem(id);
        }

        public async Task<List<CallsDto>> GetAllAsync()
        {
            var list = await repository.GetAll();
            return mapper.Map<List<CallsDto>>(list);
        }

        public async Task<CallsDto> GetByIdAsync(int id)
        {
            var call = await repository.GetById(id);
            return call == null ? null : mapper.Map<CallsDto>(call);
        }
        public async Task UpdateItemAsync(int id, CallsDto item)
        {
            var call = await repository.GetById(id);
            if (call == null)
                throw new System.Exception("קריאה לא נמצאה");

            var updated = mapper.Map<Calls>(item);
            await repository.UpdateItem(id, updated);
        }
        public async Task<string> GetStatus(int id)
        {
            var call = await repository.GetById(id);
            return call?.Status ?? "לא ידוע";
        }
        public async Task UpdateStatus(int id, string status)
        {
            var call = await repository.GetById(id);
            if (call == null)
                throw new System.Exception("קריאה לא נמצאה");

            call.Status = status;
            await repository.UpdateItem(id, call);
        }
     
        public async Task<List<CallsDto>> GetCallsByUserId(int userId)
        {
            var userCalls = await _Callrepository.GetCallsByUserId(userId);
            Console.WriteLine($"User calls count: {userCalls.Count}");
            return mapper.Map<List<CallsDto>>(userCalls);
        }
        public async Task<CallsDto> CreateCallAsync(CallsDto call)
        {
            // נטר את ה-Id כדי לוודא שמדובר ביצירה חדשה
            call.Id = 0;

            // העלאת תמונה אם קיימת
            if (call.FileImage != null)
            {
                var filePath = await UploadImage(call.FileImage);
                Console.WriteLine($"📷 Image uploaded to: {filePath}");
            }

            // שליפת מזהה משתמש מתוך JWT
            var httpContext = _httpContextAccessor.HttpContext;
            var userIdStr = httpContext?.User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;

            if (!int.TryParse(userIdStr, out int userId))
            {
                Console.WriteLine("❌ לא הצלחנו לשלוף מזהה משתמש מה־JWT");
                throw new UnauthorizedAccessException("מזהה משתמש לא תקין ב־JWT");
            }

            Console.WriteLine($"✅ User ID from token: {userId}");
            call.UserId = userId;

            // מצב ברירת מחדל
            call.Status = "נפתחה";

            // שמירת הקריאה בבסיס הנתונים
            var savedCall = await AddItemAsync(call);
            Console.WriteLine($"📦 Call saved to DB with ID: {savedCall.Id}");

            // הקצאת מתנדבים אם יש מיקום
            if (call.LocationX != 0 && call.LocationY != 0)
            {
                Console.WriteLine($"📍 Assigning volunteers near location: {call.LocationX}, {call.LocationY}");
                await Logic.AssignNearbyVolunteersToCall(savedCall.Id, call.LocationX, call.LocationY);
            }

            return savedCall;
        }


        private async Task<string> UploadImage(IFormFile file)
        {
            var folderPath = Path.Combine(Environment.CurrentDirectory, "Images");
            if (!Directory.Exists(folderPath))
                Directory.CreateDirectory(folderPath);

            var filePath = Path.Combine(folderPath, file.FileName);
            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }
            return filePath;
        }
        public async Task<string> GetCallStatusWithVolunteersInfo(int id)
        {
            var call = await GetByIdAsync(id);
            if (call == null)
                throw new System.Exception("קריאה לא נמצאה");

            var volunteersInfo = await _volunteerCallLogic.GetCallVolunteersInfo(id);
            return $"סטטוס: {call.Status}";
        }
        public async Task<CallsDto> AddCallAsync(CallsDto call, IFormFile file)
        {
            if (file != null)
            {
                var fileName = Path.GetFileName(file.FileName);
                var path = Path.Combine(Directory.GetCurrentDirectory(), "Images", fileName);
                using (var stream = new FileStream(path, FileMode.Create))
                {
                    await file.CopyToAsync(stream);
                }
                call.ArrImage = await File.ReadAllBytesAsync(path); // שמירת התמונה כ-byte[]
            }

            // שליפת מזהה משתמש מתוך JWT
            var httpContext = _httpContextAccessor.HttpContext;
            var userIdStr = httpContext?.User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (!int.TryParse(userIdStr, out int userId))
                throw new UnauthorizedAccessException("מזהה משתמש לא תקין ב־JWT");

            call.UserId = userId;
            call.Date = DateTime.Now; // או DateTime.UtcNow
            call.Status = "Open";

            var entity = mapper.Map<Calls>(call);
            var added = await repository.AddItem(entity);
            var savedCall = mapper.Map<CallsDto>(added);

            if (call.LocationX != 0 && call.LocationY != 0)
            {
                await _volunteerCallLogic.AssignNearbyVolunteersToCall(savedCall.Id, call.LocationX, call.LocationY);

            }

            return savedCall;
        }

        public async Task AssignNearbyVolunteersToCall(int callId, double locationX, double locationY)
        {
            await _volunteerCallLogic.AssignNearbyVolunteersToCall(callId, locationX, locationY);
        }
    }
}










