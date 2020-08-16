﻿using System.Threading.Tasks;
using DatingApp.API.Models;

namespace DatingApp.API.Helpers
{
    public interface ITokenService
    {
        Task<string> GenerateJwtToken(User user);
    }
}