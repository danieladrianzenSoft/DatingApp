using System;
using System.Threading.Tasks;
using System.Web;
using DatingApp.API.Helpers;
using DatingApp.API.Models;
using Microsoft.AspNetCore.Identity;

namespace DatingApp.API.Security
{
    public class AuthService : IAuthService
    {
        private readonly UserManager<User> _userManager;
        private readonly IMailer _mailer;

        public AuthService(UserManager<User> userManager, IMailer mailer)
        {
            _userManager = userManager;
            _mailer = mailer;
        }

        public async Task SendEmailVerificationLink(User user)
        {
            var confirmEmailToken = await _userManager.GenerateEmailConfirmationTokenAsync(user);
            var encodedToken = HttpUtility.UrlEncode(confirmEmailToken);
            //var confirmationLink = Url.Action("confirmEmail", "auth",
            //    new { userId = userToCreate.Id, token = confirmEmailToken }, Request.Scheme, Request.Host.ToString());

            var confirmationLink = ("http://localhost:4200/confirm-email?userId=" + user.Id + "&token=" + encodedToken);

            string message = $"Hi {user.DisplayName}, <br /> <br />" +
                $"We received a request to verify {user.Email} as your email account. " +
                $"If you made this request, <a href='{confirmationLink}'>click here</a> to complete the verification " +
                $"process. <br /> <br />" +
                $"If you did not make this request, please contact us. <br /> <br />" +
                $"Thanks, <br /> <br /> DatingApp";
          

            await _mailer.SendEmailAsync(user.Email, "Your DatingApp Account", message);
        }

        public async Task SendEmailVerificationSuccess(User user)
        {
            string subject = "Your DatingApp account has been verified";
            string message = $"Congratulations {user.DisplayName}!, <br /> <br /> You have successfully activated your account!\n " +
                "Welcome to DatingApp.";
            await _mailer.SendEmailAsync(user.Email, subject, message );
        }

        public async Task SendPasswordResetLink(User user)
        {
            string resetPasswordToken = await _userManager.GeneratePasswordResetTokenAsync(user);
            var encodedToken = HttpUtility.UrlEncode(resetPasswordToken);
            var resetPasswordLink = ("http://localhost:4200/reset-password?email=" + user.Email + "&token=" + encodedToken);

            string subject = "Your DatingApp account has been verified";
            string message = $"Hi {user.DisplayName}, <br /> <br />" +
                $"We received a request to reset the password associated with your DatingApp account. " +
                $"If you made this request, <a href='{resetPasswordLink}'>click here</a> to continue with the " +
                $"process. <br /> <br />" +
                $"If you did not make this request, please contact us. <br /> <br />" +
                $"Thanks, <br /> <br /> DatingApp";
            await _mailer.SendEmailAsync(user.Email, subject, message);
        }
    }
}
