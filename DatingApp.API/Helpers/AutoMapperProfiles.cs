using System;
using System.Linq;
using AutoMapper;
using DatingApp.API.Dtos;
using DatingApp.API.Models;

namespace DatingApp.API.Helpers
{
    public class AutoMapperProfiles : Profile
    {
        public AutoMapperProfiles()
        {
            CreateMap<User, UserForListDto>()
                .ForMember(d => d.PhotoUrl, o => o.MapFrom(s =>
                    s.Photos.FirstOrDefault(p => p.IsMain).Url))
                .ForMember(d => d.Age, o => o.MapFrom(s =>
                    s.DateOfBirth.CalculateAge()));
            CreateMap<User, UserForDetailedDto>()
                .ForMember(d => d.PhotoUrl, o => o.MapFrom(s =>
                    s.Photos.FirstOrDefault(p => p.IsMain).Url))
                .ForMember(d => d.Age, o => o.MapFrom(s =>
                    s.DateOfBirth.CalculateAge()));
            CreateMap<Photo, PhotosForDetailedDto>();
            CreateMap<UserForUpdateDto, User>();
        }
    }
}
