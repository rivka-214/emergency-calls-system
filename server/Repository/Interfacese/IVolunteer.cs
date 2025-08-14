using Reposetory.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Repository.Interfacese
{
    public interface IVolunteer 
    {
         Task<List<Volunteers>> GetVolunteersNotAssignedToCall(int callId);
    }
}
