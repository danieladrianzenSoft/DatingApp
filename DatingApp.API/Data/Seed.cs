using System;
using System.Collections.Generic;
using System.Linq;
using DatingApp.API.Models;
using Microsoft.AspNetCore.Identity;
using Newtonsoft.Json;

namespace DatingApp.API.Data
{
    public class Seed
    {
        public static void SeedUsers(UserManager<User> userManager, RoleManager<Role> roleManager)
        {   // This method will be run once at the start of the application, before any other users have
            // access to our application. 
            if (userManager.Users.Any() == false)
            {
                var userData = System.IO.File.ReadAllText("Data/UserSeedData.json");
                var users = JsonConvert.DeserializeObject<List<User>>(userData);

                // create some roles

                var roles = new List<Role>
                {
                    new Role{Name = "Member"},
                    new Role{Name = "Admin"},
                    new Role{Name = "Moderator"},
                    new Role{Name = "VIP"}

                };

                foreach (var role in roles)
                {
                    roleManager.CreateAsync(role).Wait();
                }

                foreach (var user in users)
                {
                    userManager.CreateAsync(user, "password").Wait();
                    userManager.AddToRoleAsync(user, "Member");
                    user.Photos.SingleOrDefault().IsApproved = true;
                    user.EmailConfirmed = true;
                }

                // create admin user

                var adminUser = new User
                {
                    UserName = "Admin",
                    Email = "admin@email.com",
                    EmailConfirmed = true
                };

                // change this to make password much more secure.
                var result = userManager.CreateAsync(adminUser, "password").Result;

                if (result.Succeeded)
                {
                    // the admin will have roles of both admin and moderator.
                    var admin = userManager.FindByNameAsync("Admin").Result;
                    userManager.AddToRolesAsync(admin, new[] {"Admin", "Moderator"});
                }

            }
        }

        //private static void CreatePasswordHash(string password, out byte[] passwordHash, out byte[] passwordSalt)
        //{
        //    using (var hmac = new System.Security.Cryptography.HMACSHA512())
        //    {   // using statement so hmac instance gets disposed at the end of statement.
        //        // We will set the salt as the key of hmac, and convert the password to bytes
        //        // via encoding so we can pass it on to the computehash method. 

        //        passwordSalt = hmac.Key;
        //        passwordHash = hmac.ComputeHash(System.Text.Encoding.UTF8.GetBytes(password));
        //    }
        //}
    }
}
