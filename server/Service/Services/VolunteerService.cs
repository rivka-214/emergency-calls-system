


using AutoMapper;
using Common.Dto;
using Reposetory.Entities;
using Repository.Interfacese;
using Service.Interfaces;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Service.Services
{
    public class VolunteerService : IService<VolunteersDto>
    {
        private readonly IRepository<Volunteers> _repository;
        private readonly IMapper _mapper;

        public VolunteerService(IRepository<Volunteers> repository, IMapper mapper)
        {
            _repository = repository;
            _mapper = mapper;
        }

        public async Task<VolunteersDto> AddItemAsync(VolunteersDto item)
        {
            var entity = _mapper.Map<Volunteers>(item);
            var added = await _repository.AddItem(entity);
            return _mapper.Map<VolunteersDto>(added);
        }

        public async Task DeleteItemAsync(int id)
        {
            await _repository.DeleteItem(id);
        }

        public async Task<List<VolunteersDto>> GetAllAsync()
        {
            var list = await _repository.GetAll();
            return _mapper.Map<List<VolunteersDto>>(list);
        }

        public async Task<VolunteersDto> GetByIdAsync(int id)
        {
            var entity = await _repository.GetById(id);
            return _mapper.Map<VolunteersDto>(entity);
        }

        public async Task UpdateItemAsync(int id, VolunteersDto item)
        {
            var entity = _mapper.Map<Volunteers>(item);
            await _repository.UpdateItem(id, entity);
        }
    }
}



