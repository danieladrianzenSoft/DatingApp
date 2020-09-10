using System;
using DatingApp.API.Models;

namespace DatingApp.API.Security
{
    public class RefreshToken
    {
        public int Id { get; set; }
        public virtual User User { get; set; }
        public string Token { get; set; }
        public DateTime Expires { get; set; } = DateTime.UtcNow.AddHours(1);
        public bool IsExpired => DateTime.UtcNow >= Expires;
        public DateTime? Revoked { get; set; }
        public bool IsActive => Revoked == null & IsExpired == false;

        public RefreshToken()
        {
        }
    }
}
