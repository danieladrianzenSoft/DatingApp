using System;
namespace DatingApp.API.Helpers
{
    public class EmailConfiguration : IEmailConfiguration
    {
        public string SmtpServer { get; set; }
        public int SmtpPort { get; set; }
        public string SenderName { get; set; }
        public string SenderEmail { get; set; }
        public string SmtpUsername { get; set; }
        public string SmtpPassword { get; set; }
        
    }
}
