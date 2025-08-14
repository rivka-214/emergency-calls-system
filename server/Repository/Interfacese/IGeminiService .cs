using System.Threading.Tasks;

namespace Service.Services
{
    public interface IGeminiService
    {
        Task<string> GetFirstAidInstructionsAsync(string description);
    }
}
