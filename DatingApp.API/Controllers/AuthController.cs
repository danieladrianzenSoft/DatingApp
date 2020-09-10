using System;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using AutoMapper;
using DatingApp.API.Data;
using DatingApp.API.Dtos;
using DatingApp.API.Errors;
using DatingApp.API.Helpers;
using DatingApp.API.Models;
using DatingApp.API.Security;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace DatingApp.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class AuthController : ControllerBase
    {
        private readonly IMapper _mapper;
        private readonly UserManager<User> _userManager;
        private readonly SignInManager<User> _signInManager;
        private readonly ITokenService _tokenService;
        private readonly IDatingRepository _repo;
        //private readonly IMailer _mailer;
        private readonly IAuthService _authService;

        //private readonly IEmailService _emailService;

        public AuthController(IMapper mapper, UserManager<User> userManager,
            SignInManager<User> signInManager, ITokenService tokenService,
            IDatingRepository repo, IAuthService authService)
        {
            _mapper = mapper;
            _userManager = userManager;
            _signInManager = signInManager;
            _tokenService = tokenService;
            _repo = repo;
            //_mailer = mailer;
            _authService = authService;
        }

        [AllowAnonymous]
        [HttpPost("register")]
        public async Task<IActionResult> Register(UserForRegisterDto userForRegisterDto)
        {

            var userToCreate = _mapper.Map<User>(userForRegisterDto);

            var existingUser = await _userManager.FindByEmailAsync(userToCreate.Email);

            if (existingUser != null)
            {
                return BadRequest(new ApiResponse(400, "User with this email already exists"));
            }

            existingUser = await _userManager.FindByNameAsync(userToCreate.UserName);

            if (existingUser != null)
            {
                return BadRequest(new ApiResponse(400, "User with this username already exists"));
            }

            //var refreshToken = _tokenService.GenerateRefreshToken();
            //userToCreate.RefreshTokens.Add(refreshToken);

            var result = await _userManager.CreateAsync(userToCreate, userForRegisterDto.Password);

            // we map to a userfordetailedDto  because we don't want to return username and password
            // of our created user.
            if (result.Succeeded)
            {
                await _userManager.AddToRoleAsync(userToCreate, "Member");
                await _authService.SendEmailVerificationLink(userToCreate);

                var userToReturn = _mapper.Map<UserForDetailedDto>(userToCreate);

                return CreatedAtRoute("GetUser", new { controller = "Users", id = userToCreate.Id }, userToReturn);

            }

            return BadRequest(new ApiResponse(400));

        }

        [AllowAnonymous]
        [HttpPost("login")]
        // [ValidateAntiForgeryToken]
        public async Task<IActionResult> Login(UserForLoginDto userForLoginDto)
        {

            var user = await _userManager.FindByNameAsync(userForLoginDto.Username);
            if (user == null)
            {
                user = await _userManager.FindByEmailAsync(userForLoginDto.Username);

                if (user == null)
                {
                    return Unauthorized(new ApiResponse(401, "Username or password is invalid"));
                }

                userForLoginDto.Username = user.UserName;

            }

            // we set false to lock out user on failed attempts.
            var result = await _signInManager.CheckPasswordSignInAsync(user, userForLoginDto.Password, false);

            if (result.Succeeded)
            {

                var appUser = await _userManager.Users.Include(p => p.Photos).Include(r => r.RefreshTokens)
                    .FirstOrDefaultAsync(u => u.NormalizedUserName == userForLoginDto.Username.ToUpper());
                appUser.IsOnline = true;

                var refreshToken = _tokenService.GenerateRefreshToken();

                appUser.RefreshTokens.Add(refreshToken);

                await _userManager.UpdateAsync(appUser);

                var userToReturn = _mapper.Map<UserForRefreshTokenDto>(appUser);

                await _repo.SaveAll();

                SetTokenCookie(userToReturn.RefreshToken);

                return Ok(new
                {
                    token = _tokenService.GenerateJwtToken(user).Result,
                    user = userToReturn,
                });
            }

            else if (result.IsNotAllowed)
            {
                var isVerified = _userManager.IsEmailConfirmedAsync(user).Result;

                if (isVerified == false)
                {
                    return Unauthorized(new ApiResponse(401, "Email address not verified"));

                }
                return Unauthorized(new ApiResponse(401));
            }

            return Unauthorized(new ApiResponse(401, "Username or password is invalid"));

        }

        [AllowAnonymous]
        [HttpPost("confirmEmail")]
        public async Task<IActionResult> ConfirmEmail(string userId, string token)
        { 

            if (userId == null || token == null)
            {
                return BadRequest(new ApiResponse(400));
            }

            var user = await _userManager.FindByIdAsync(userId);

            if (user == null)
            {
                return BadRequest(new ApiResponse(400));
            }

            if (user.EmailConfirmed == true)
            {
                //return BadRequest(new ApiResponse(400, "Your email address has already been verified"));
                return Ok(false);
            }

            var result = await _userManager.ConfirmEmailAsync(user, token);

            if (result.Succeeded)
            {
                await _authService.SendEmailVerificationSuccess(user);

                return Ok(true);
            }

            return BadRequest(new ApiResponse(400));
        }

        [AllowAnonymous]
        [HttpPost("sendEmailVerification")]
        public async Task<IActionResult> SendEmailVerification(UserForLoginDto userForLoginDto)
        {

            var user = await _userManager.FindByNameAsync(userForLoginDto.Username);
            if (user == null)
            {
                user = await _userManager.FindByEmailAsync(userForLoginDto.Username);

                if (user == null)
                {
                    return Unauthorized(new ApiResponse(401));
                }

                userForLoginDto.Username = user.UserName;

            }

            // we set false to lock out user on failed attempts.
            //var result = await _signInManager.CheckPasswordAsync(user, userForLoginDto.Password, false);

            var result = await _userManager.CheckPasswordAsync(user, userForLoginDto.Password);

            if (result == true)
            {

                await _authService.SendEmailVerificationLink(user);

                return Ok(true);
                
            }

            return Unauthorized(new ApiResponse(401));

        }

        [AllowAnonymous]
        [HttpGet("emailexists")]
        public async Task<ActionResult<bool>> CheckEmailExistsAsync([FromQuery] string email)
        {
            return await _userManager.FindByEmailAsync(email) != null;
        }

        [AllowAnonymous]
        [HttpPost("forgotPassword")]
        public async Task<IActionResult> ForgotPassword(UserForForgotPasswordDto userForForgotPasswordDto)
        {
            var user = await _userManager.FindByEmailAsync(userForForgotPasswordDto.Email);

            if (user == null)
            {
                return Unauthorized(new ApiResponse(401));
            }
            if (await _userManager.IsEmailConfirmedAsync(user) == false)
            {
                return Unauthorized(new ApiResponse(401, "Email address not verified"));
            }

            await _authService.SendPasswordResetLink(user);

            return Ok(true);
        }

        [AllowAnonymous]
        [HttpPost("resetPassword")]
        public async Task<IActionResult> ResetPassword(UserForPasswordResetDto model)
        {
            if (model.Email == null || model.Token == null)
            {
                return Unauthorized(new ApiResponse(401));
            }

            var user = await _userManager.FindByEmailAsync(model.Email);

            if (user == null)
            {
                return Unauthorized(new ApiResponse(401));
            }

            if (await _userManager.VerifyUserTokenAsync(user, _userManager.Options.Tokens.PasswordResetTokenProvider, "ResetPassword", model.Token) == false)
            {
                return BadRequest(new ApiResponse(400, "Invalid Token"));
            }

            var result = await _userManager.ResetPasswordAsync(user, model.Token, model.Password);

            if (result.Succeeded)
            {
                return Ok();
            }

            return BadRequest(new ApiResponse(400));
        }

        [HttpPost("refreshToken")]
        public async Task<ActionResult<User>> RefreshToken()
        {
            var submittedRefreshToken = Request.Cookies["refreshToken"];

            if (submittedRefreshToken == null)
            {
                return Unauthorized(new ApiResponse(401));
            }

            //var user = await _userManager.FindUserByEmailClaimsPrincipleAsync(HttpContext.User);
            var user = await _userManager.FindByNameAsync(User.FindFirst(ClaimTypes.Name).Value);
            //var user = await _userManager.FindByIdAsync(int.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value).ToString());


            if (user == null)
            {
                return Unauthorized(new ApiResponse(401));
            }
            var appUser = await _userManager.Users.Include(p => p.Photos).Include(r => r.RefreshTokens)
                .FirstOrDefaultAsync(u => u.NormalizedUserName == user.UserName.ToUpper());
            var refreshToken = UpdateRefreshToken(appUser, submittedRefreshToken);

            if (refreshToken == null)
            {
                return Unauthorized(new ApiResponse(401));
            }

            appUser.RefreshTokens.Add(refreshToken);

            await _userManager.UpdateAsync(user);

            var userToReturn = _mapper.Map<UserForRefreshTokenDto>(appUser);

            SetTokenCookie(userToReturn.RefreshToken);

            await _repo.SaveAll();

            return Ok(new
            {
                token = _tokenService.GenerateJwtToken(user).Result,
                user = userToReturn,
            });
      
        }

        [HttpPost("revokeToken")]
        public async Task<ActionResult> RevokeToken()
        {
            var submittedRefreshToken = Request.Cookies["refreshToken"];

            if (submittedRefreshToken == null)
            {
                return Unauthorized(new ApiResponse(401));
            }

            //var user = await _userManager.FindUserByEmailClaimsPrincipleAsync(HttpContext.User);
            //var user = await _userManager.FindByIdAsync(int.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value).ToString());
            var user = await _userManager.FindByNameAsync(User.FindFirst(ClaimTypes.Name).Value);

            if (user == null)
            {
                return Unauthorized(new ApiResponse(401));

            }

            var appUser = await _userManager.Users.Include(r => r.RefreshTokens)
                .FirstOrDefaultAsync(u => u.NormalizedUserName == user.UserName.ToUpper());

            var revokedToken = RevokeRefreshToken(appUser, submittedRefreshToken);

            if (revokedToken == null)
            {
                return Unauthorized(new ApiResponse(401));
            }

            var inactiveRefreshTokens = appUser.RefreshTokens.Where(r => r.IsActive == false ).OrderBy(r => r.Expires).ToList();

            if (inactiveRefreshTokens.Count > 5)
            {
                var overflowInactiveTokens = inactiveRefreshTokens.Take(inactiveRefreshTokens.Count - 4);
                foreach (RefreshToken token in overflowInactiveTokens)
                {
                    _repo.Delete(token);
                }
            }

            appUser.IsOnline = false;
            await _repo.SaveAll();

            SetTokenCookie(revokedToken.Token);

            return Ok();

        }

        private RefreshToken UpdateRefreshToken(User user, string refreshToken)
        {
            var inputRefreshToken = refreshToken;
            var oldRefreshToken = user.RefreshTokens.SingleOrDefault(x => x.Token == refreshToken);

            if (oldRefreshToken != null && oldRefreshToken.IsActive == false)
            {
                return null;
            }
            if (oldRefreshToken != null)
            {
                oldRefreshToken.Revoked = DateTime.UtcNow;
            }

            var newRefreshToken = _tokenService.GenerateRefreshToken();

            return newRefreshToken;
        }

        private RefreshToken RevokeRefreshToken(User user, string refreshToken)
        {
            var inputRefreshToken = refreshToken;
            var oldRefreshToken = user.RefreshTokens.SingleOrDefault(x => x.Token == refreshToken);

            if (oldRefreshToken != null && oldRefreshToken.IsActive == false)
            {
                return null;
            }
            if (oldRefreshToken != null)
            {
                oldRefreshToken.Revoked = DateTime.UtcNow;
            }

            return oldRefreshToken;
        }

        private void SetTokenCookie(string refreshToken)
        {
            var cookieOptions = new CookieOptions
            {
                HttpOnly = true,
                Secure = true,
                SameSite = SameSiteMode.Strict,
                Expires = DateTime.UtcNow.AddHours(1)
            };
            Response.Cookies.Append("refreshToken", refreshToken, cookieOptions);
        }

    }
}
