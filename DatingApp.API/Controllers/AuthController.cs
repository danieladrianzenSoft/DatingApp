using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;
using AutoMapper;
using DatingApp.API.Data;
using DatingApp.API.Dtos;
using DatingApp.API.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;

namespace DatingApp.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [AllowAnonymous]
    public class AuthController : ControllerBase
    {
        private readonly IConfiguration _config;
        private readonly IMapper _mapper;
        private readonly UserManager<User> _userManager;
        private readonly SignInManager<User> _signInManager;

        public AuthController(IConfiguration config, IMapper mapper,
            UserManager<User> userManager, SignInManager<User> signInManager)
        {
            _config = config;
            _mapper = mapper;
            _userManager = userManager;
            _signInManager = signInManager;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register(UserForRegisterDto userForRegisterDto)
        {

            var userToCreate = _mapper.Map<User>(userForRegisterDto);

            var result = await _userManager.CreateAsync(userToCreate, userForRegisterDto.Password);

            var userToReturn = _mapper.Map<UserForDetailedDto>(userToCreate);
                // we map to a userfordetailedDto because we don't want to return username and password
                // of our created user.
            if (result.Succeeded)
            {
                return CreatedAtRoute("GetUser", new { controller = "Users", id = userToCreate.Id }, userToReturn);

                // this needs to be a createdatroute to redirect client to newly created user
                // but we don't have a method to return the user yet. 
            }

            return BadRequest(result.Errors);

        }

        [HttpPost("login")]
        public async Task<IActionResult> Login(UserForLoginDto userForLoginDto)
        {

            var user = await _userManager.FindByNameAsync(userForLoginDto.Username);

            // we set false to lock out user on failed attempts.
            var result = await _signInManager.CheckPasswordSignInAsync(user, userForLoginDto.Password, false);

            if (result.Succeeded)
            {
                var appUser = await _userManager.Users.Include(p => p.Photos)
                    .FirstOrDefaultAsync(u => u.NormalizedUserName == userForLoginDto.Username.ToUpper());

                var userToReturn = _mapper.Map<UserForListDto>(appUser);

                // Then we return our token wrapped in an Ok response.

                return Ok(new
                {
                    token = GenerateJwtToken(user).Result,
                    user = userToReturn
                });
            }

            return Unauthorized();

        }

        private async Task<string> GenerateJwtToken(User user)
        {
            // set 2 claims for token. One containes user id, the second is the username.

            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Name, user.UserName)
            };

            var roles = await _userManager.GetRolesAsync(user);

            foreach (var role in roles)
            {
                claims.Add(new Claim(ClaimTypes.Role, role));
            }

            // to make sure that the token is valid, the server needs to validate it by signing it,
            // and here we are doing that by adding an encryption of a key which we have stored
            // in appsettings.json, and which will be part of our sign in credentials.

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config
                        .GetSection("AppSettings:Token").Value));

            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha512Signature);

            // Here we add a descriptor for our token containing our claims, an expiry date,
            // and our signing credentials (which we have created above) containing our 
            // encrypted security key. 

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(claims),
                Expires = DateTime.Now.AddDays(1),
                SigningCredentials = creds
            };

            // Then we create a Jwt handler for our token, and use it to actually create our
            // token based on the descriptor that was built.

            var tokenHandler = new JwtSecurityTokenHandler();

            var token = tokenHandler.CreateToken(tokenDescriptor);

            return tokenHandler.WriteToken(token);
        }
    }
}
