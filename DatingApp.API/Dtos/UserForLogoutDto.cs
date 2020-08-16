using System;
namespace DatingApp.API.Dtos
{
    public class UserForLogoutDto
    {
        public string Username { get; set; }
        public bool IsOnline { get; set; }
    }
}
