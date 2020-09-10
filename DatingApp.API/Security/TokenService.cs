using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;
using DatingApp.API.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;

namespace DatingApp.API.Security
{
    public class TokenService : ITokenService
    {
        private readonly IConfiguration _config;
        private readonly UserManager<User> _userManager;
        private readonly SignInManager<User> _signInManager;
        private readonly SymmetricSecurityKey _key;

        public TokenService(IConfiguration config, UserManager<User> userManager, SignInManager<User> signInManager)
        {
            _config = config;
            _userManager = userManager;
            _signInManager = signInManager;
            _key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["Token:Key"]));
            //SymmetricSecurityKey takes a byte array, not a string, so we need to
            //use an encoder.
        }

        public async Task<string> GenerateJwtToken(User user)
        {
            //User claims a certain date of birth, or email, etc.
            //if a user has their token, they will be able to get their email and
            //display name. Just be careful to not put any sensitive info here.
            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Name, user.UserName),
                //new Claim(ClaimTypes.Email, user.Email)
            };

            var roles = await _userManager.GetRolesAsync(user);

            foreach (var role in roles)
            {
                claims.Add(new Claim(ClaimTypes.Role, role));
            }

            var creds = new SigningCredentials(_key, SecurityAlgorithms.HmacSha512Signature);
            //HmacSha512Signature is the largest level of encryption.

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(claims),
                Expires = DateTime.UtcNow.AddMinutes(8), //The token is valid for 8 mins. After 7 mins, on client side,
                //we will request a new token using the refresh token, which expires after 1 hour.
                SigningCredentials = creds,
                Issuer = _config["Token:Issuer"]
            };

            var tokenHandler = new JwtSecurityTokenHandler();

            var token = tokenHandler.CreateToken(tokenDescriptor);
            //create token with all the specs of tokenDescriptor.

            return tokenHandler.WriteToken(token);
        }

        public RefreshToken GenerateRefreshToken()
        {
            var randomNumber = new byte[32];
            using (var rng = RandomNumberGenerator.Create())
            {
                rng.GetBytes(randomNumber);
            }
            return new RefreshToken
            {
                Token = Convert.ToBase64String(randomNumber)
            };
        }

    }
}
