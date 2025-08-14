using Microsoft.EntityFrameworkCore;
using Reposetory.Entities;
using Repository.Entities;
using Repository.Interfacese;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Repository.Repositories
{
    internal class UserRepository : IRepository<User>
    {
        private readonly IContext context;
        public UserRepository(IContext context)
        {
            this.context = context;
        }

        public async Task<User> AddItem(User item)
        {
            await this.context.UsersDb.AddAsync(item);
            await this.context.SaveAsync();
            return item;
        }

        public async Task DeleteItem(int id)
        {
            var user = await GetById(id);
            this.context.UsersDb.Remove(user);
            await this.context.SaveAsync();
        }

        public async Task<List<User>> GetAll()
        {
            return await this.context.UsersDb.ToListAsync();
        }

        public async Task<User> GetById(int id)
        {
            return await context.UsersDb.FirstOrDefaultAsync(x => x.Id == id);
        }

        public async Task UpdateItem(int id, User item)
        {
            var user = await GetById(id);
            user.FirstName = item.FirstName;
            user.password = item.password;
            user.PhoneNumber = item.PhoneNumber;
            user.Gmail = item.Gmail;

            await context.SaveAsync();
        }
    }
}
