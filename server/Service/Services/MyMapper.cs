// Service/Services/MyMapper.cs
// החזרה למצב הקודם עם תיקון הסגנון

using AutoMapper;
using Common.Dto;
using Microsoft.AspNetCore.Http;
using Reposetory.Entities;
using Repository.Entities;

namespace Service.Services
{
    public class MyMapper : Profile
    {
        public MyMapper()
        {
            string path = Path.Combine(Environment.CurrentDirectory, "Images/");

            CreateMap<CallsDto, Calls>()
                .ForMember(dest => dest.ImageUrl, opt => opt.MapFrom(src => src.FileImage.FileName));

            CreateMap<Calls, CallsDto>()
                .ForMember(dest => dest.ArrImage, opt => opt.MapFrom(src =>
                    File.Exists(Path.Combine(path, src.ImageUrl))
                    ? File.ReadAllBytes(Path.Combine(path, src.ImageUrl))
                    : null
                ));

            CreateMap<VolunteerCalls, VolunteerCallsDto>()
                .ForMember(dest => dest.Call, opt => opt.MapFrom(src => src.Calls))
                .ReverseMap()
                .ForMember(dest => dest.Calls, opt => opt.MapFrom(src => src.Call));

            CreateMap<Volunteers, VolunteersDto>().ReverseMap();
            CreateMap<User, UserDto>()
                .ForMember(dest => dest.UserId, opt => opt.MapFrom(src => src.UserId));
            CreateMap<UserDto, User>()
                .ForMember(dest => dest.UserId, opt => opt.MapFrom(src => src.UserId));
        }
    }
}