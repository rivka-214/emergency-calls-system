using AutoMapper;
using Common.Dto;
using Reposetory.Entities;
using Repository.Entities;
using Repository.Interfacese;
using Service.Interfaces;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Service.Services
{
    public class UserService : IService<UserDto>, IUserServicecs
    {
        private readonly IRepository<User> _repository;
        private readonly IMapper _mapper;

        public UserService(IRepository<User> repository, IMapper mapper)
        {
            _repository = repository;
            _mapper = mapper;
        }

        public async Task<UserDto> AddItemAsync(UserDto item)
        {
            var entity = _mapper.Map<User>(item);
            var added = await _repository.AddItem(entity);
            return _mapper.Map<UserDto>(added);
        }

        public async Task DeleteItemAsync(int id)
        {
            await _repository.DeleteItem(id);
        }

        public async Task<List<UserDto>> GetAllAsync()
        {
            var list = await _repository.GetAll();
            return _mapper.Map<List<UserDto>>(list);
        }

        public async Task<UserDto> GetByIdAsync(int id)
        {
            var entity = await _repository.GetById(id);
            return _mapper.Map<UserDto>(entity);
        }

        public async Task UpdateItemAsync(int id, UserDto item)
        {
            var entity = _mapper.Map<User>(item);
            await _repository.UpdateItem(id, entity);
        }
        public async Task<bool> GmailExistsAsync(string gmail)
        {
            var users = await GetAllAsync();
            return users.Any(u => u.Gmail.Equals(gmail, StringComparison.OrdinalIgnoreCase));
        }
    }
}
