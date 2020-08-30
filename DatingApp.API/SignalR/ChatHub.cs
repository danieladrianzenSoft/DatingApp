using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using AutoMapper;
using DatingApp.API.Data;
using DatingApp.API.Dtos;
using DatingApp.API.Errors;
using DatingApp.API.Helpers;
using DatingApp.API.Models;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;

namespace DatingApp.API.SignalR
{
    //[ServiceFilter(typeof(LogUserActivity))]
    [Authorize]
    public class ChatHub : Hub
    {
        private IDatingRepository _repo;
        private IMapper _mapper;
        //private UserManager<User> _userManager;

        public ChatHub(IDatingRepository repo, IMapper mapper)
        {
            _repo = repo;
            _mapper = mapper;
            //_userManager = userManager;
        }
        public async Task SendMessage(int userId, MessageForCreationDto messageForCreationDto)
        {

            messageForCreationDto.SenderId = userId;

            var recipientId = messageForCreationDto.RecipientId;

            var message = _mapper.Map<Message>(messageForCreationDto);

            _repo.Add(message);

            await _repo.SaveAll();

            var messageToReturn = _mapper.Map<MessageToReturnDto>(message);

            var sender = await _repo.GetUser(userId, true);

            var recipient = await _repo.GetUser(recipientId, true);

            messageToReturn.RecipientDisplayName = recipient.DisplayName;

            messageToReturn.SenderDisplayName = sender.DisplayName;

            await Clients.Group(recipientId.ToString()).SendAsync("ReceiveMessage", messageToReturn);
            await Clients.Group(userId.ToString()).SendAsync("ReceiveMessage", messageToReturn);
        }

        public async Task MarkAsRead(int userId, int id)
        {
            var message = await _repo.GetMessage(id);

            if (message.RecipientId == userId && message.IsRead == false)
            {
                message.IsRead = true;
                message.DateRead = DateTime.Now;
                await _repo.SaveAll();
            }

        }

        public async Task AddToGroup(string groupName)
        {

            await Groups.AddToGroupAsync(Context.ConnectionId, groupName);

        }
        public async Task RemoveFromGroup(string groupName)
        {

            await Groups.RemoveFromGroupAsync(Context.ConnectionId, groupName);


        }

    }
}
