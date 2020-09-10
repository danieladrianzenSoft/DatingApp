using System;
using System.Threading.Tasks;
using DatingApp.API.Models;

namespace DatingApp.API.Security
{
    public interface IAuthService
    {
        Task SendEmailVerificationLink(User user);
        Task SendEmailVerificationSuccess(User user);
        Task SendPasswordResetLink(User user);
    }
}
