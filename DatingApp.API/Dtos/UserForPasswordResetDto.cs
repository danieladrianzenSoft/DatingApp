using System;
using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace DatingApp.API.Dtos
{
    public class UserForPasswordResetDto
    {
        [Required]
        [EmailAddress]
        public string Email { get; set; }

        [Required]
        [StringLength(8, MinimumLength = 4, ErrorMessage = "You must specify a password between 4 and 8 characters.")]
        public string Password { get; set; }

        [Required]
        public string Token { get; set; }

    }
}
