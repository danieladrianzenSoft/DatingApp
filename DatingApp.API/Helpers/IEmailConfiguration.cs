using System;
namespace DatingApp.API.Helpers
{
    public interface IEmailConfiguration
    {
        string SmtpServer { get; }
        int SmtpPort { get; }
        string SenderName { get; set; }
        string SenderEmail { get; set; }
        string SmtpUsername { get; set; }
        string SmtpPassword { get; set; }
    }
}
