using System;
using System.Text.Json.Serialization;
using DatingApp.API.Security;

namespace DatingApp.API.Dtos
{
    public class UserForLoginDto
    {
        public int Id { get; set; }
        public string Username { get; set; }
        public string Password { get; set; }

    }
}
