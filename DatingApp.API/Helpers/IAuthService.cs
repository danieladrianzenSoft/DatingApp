using System;
using System.Threading.Tasks;
using DatingApp.API.Models;

namespace DatingApp.API.Helpers
{
    public interface IAuthService
    {
        Task SendEmailVerificationLink(User user);
        Task SendEmailVerificationSuccess(User user);
    }
}
