using Reposetory.Entities;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Repository.Interfacese
{
    public interface ICallsRepository : IRepository<Calls>
    {
        Task<List<Calls>> GetCallsByUserId(int userId);
    }
}
