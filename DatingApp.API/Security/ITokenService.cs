using System.Threading.Tasks;
using DatingApp.API.Models;

namespace DatingApp.API.Security
{
    public interface ITokenService
    {
        Task<string> GenerateJwtToken(User user);
        RefreshToken GenerateRefreshToken();
    }
}