using System;
using System.Threading.Tasks;

namespace DatingApp.API.Helpers
{
    public interface IMailer
    {
        Task SendEmailAsync(string email, string subject, string body);
    }
}
