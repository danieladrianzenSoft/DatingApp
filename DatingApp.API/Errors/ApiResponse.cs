using System;
namespace DatingApp.API.Errors
{
    public class ApiResponse
    {
        public ApiResponse(int statusCode, string message = null)
        {
            StatusCode = statusCode;
            Message = message ?? GetDefaultMessageForStatusCode(statusCode);

            //?? is the null coalescing indicator, which executes the method to the
            //right of it if the property to the left is null.
        }

        public int StatusCode { get; set; }
        public string Message { get; set; }

        private string GetDefaultMessageForStatusCode(int statusCode)
        {
            return statusCode switch
            {
                400 => "Action failed", //bad request
                401 => "Not authorized", //unauthorized
                403 => "Forbidden",
                404 => "Not found", //not found
                500 => "Server error, please try again later", //server error
                _ => null
            };
        }
    }
}
