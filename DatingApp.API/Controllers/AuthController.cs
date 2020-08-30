using System.Threading.Tasks;
using AutoMapper;
using DatingApp.API.Data;
using DatingApp.API.Dtos;
using DatingApp.API.Errors;
using DatingApp.API.Helpers;
using DatingApp.API.Models;
using Microsoft.AspNetCore.Authorization;
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

                var appUser = await _userManager.Users.Include(p => p.Photos)
                    .FirstOrDefaultAsync(u => u.NormalizedUserName == userForLoginDto.Username.ToUpper());
                appUser.IsOnline = true;


                var userToReturn = _mapper.Map<UserForListDto>(appUser);


                await _repo.SaveAll();


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

            //if (user.EmailConfirmed == true)
            //{
            //    return BadRequest(new ApiResponse(400, "Your email address has already been verified"));
            //    //return Ok(false);
            //}

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

                return Ok();
                
            }

            return Unauthorized(new ApiResponse(401));


        }

        [AllowAnonymous]
        [HttpGet("emailexists")]
        public async Task<ActionResult<bool>> CheckEmailExistsAsync([FromQuery] string email)
        {
            return await _userManager.FindByEmailAsync(email) != null;
        }
    }
}
