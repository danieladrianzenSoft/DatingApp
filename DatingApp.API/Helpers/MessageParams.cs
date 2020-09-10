using System;
namespace DatingApp.API.Helpers
{
    public class MessageParams
    {
        private const int MaxPageSize = 25;
        public int PageNumber { get; set; } = 1;
        private int pageSize = 15;
        public int PageSize
        {
            get { return pageSize; }
            set { pageSize = (value > MaxPageSize) ? MaxPageSize : value; }
        }

        public int UserId { get; set; }
        public string MessageContainer { get; set; }

        public MessageParams()
        {
        }
    }
}
