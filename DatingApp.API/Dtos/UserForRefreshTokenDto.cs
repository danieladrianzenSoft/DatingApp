﻿using System;
using Newtonsoft.Json;

namespace DatingApp.API.Dtos
{
    public class UserForRefreshTokenDto
    {
        public int Id { get; set; }
        public string Username { get; set; }
        public string Gender { get; set; }
        public int Age { get; set; }
        public string DisplayName { get; set; }
        public DateTime Created { get; set; }
        public DateTime LastActive { get; set; }
        public bool IsOnline { get; set; }
        public string City { get; set; }
        public string Country { get; set; }
        public string PhotoUrl { get; set; }
        [JsonIgnore]
        public string RefreshToken { get; set; }

    }
}