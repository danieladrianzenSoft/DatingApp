using System;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using DatingApp.API.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace DatingApp.API.Helpers
{
    public static class UserManagerExtensions
    {
        public static async Task<User> FindUserByEmailClaimsPrincipleAsync(this UserManager<User> input,
            ClaimsPrincipal user)
        {
            //This is just for convenience, so we can do less typing and access the user email without
            //having to type too much code.
            var email = user?.Claims?.FirstOrDefault(x => x.Type == ClaimTypes.Email)?.Value;

            return await input.Users.SingleOrDefaultAsync(x => x.Email == email);
        }
    }
}
