using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AutoMapper;
using DatingApp.API.Dtos;
using DatingApp.API.Helpers;
using DatingApp.API.Models;
using Microsoft.EntityFrameworkCore;

namespace DatingApp.API.Data
{
    public class DatingRepository : IDatingRepository
    {
        private readonly DataContext _context;
        private readonly IMapper _mapper;

        public DatingRepository(DataContext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }

        public void Add<T>(T entity) where T : class
        {
            _context.Add(entity);
        }

        public void Delete<T>(T entity) where T : class
        {
            _context.Remove(entity);
        }

        public async Task<Like> GetLike(int userId, int recipientId)
        {
            return await _context.Likes.FirstOrDefaultAsync(u =>
                u.LikerId == userId && u.LikeeId == recipientId);
        }

        public async Task<Photo> GetMainPhotoForUser(int userId)
        {
            return await _context.Photos.Where(u => u.UserId == userId)
                .FirstOrDefaultAsync(p => p.IsMain);
        }

        public async Task<Photo> GetPhoto(int id)
        {
            var photo = await _context.Photos.IgnoreQueryFilters()
                .FirstOrDefaultAsync(p => p.Id == id);

            return photo;
        }

        public async Task<User> GetUser(int id, bool isCurrentUser)
        {   // Here we want to return the user, but also include the photo. This won't
            // be passed in automatically because photos are considered navigation
            // properties, so we need to tell EF to include it.

            var query = _context.Users.Include(p => p.Photos).AsQueryable();

            if (isCurrentUser)
                query = query.IgnoreQueryFilters();

            //var user = await _context.Users.Include(p => p.Photos).FirstOrDefaultAsync(u => u.Id == id);
            var user = await query.FirstOrDefaultAsync(u => u.Id == id);


            return user;
        }

        public async Task<PagedList<User>> GetUsers(UserParams userParams)
        {
            var users = _context.Users.Include(p => p.Photos)
                .OrderByDescending(u => u.LastActive).AsQueryable();

            // filtering:

            users = users.Where(u => u.Id != userParams.UserId); // filter out current user.

            users = users.Where(u => u.Gender == userParams.Gender);

            if (userParams.Likers)
            {
                var userLikers = await GetUserLikes(userParams.UserId, userParams.Likers);
                users = users.Where(u => userLikers.Contains(u.Id));
            }

            if (userParams.Likees)
            {
                var userLikees = await GetUserLikes(userParams.UserId, userParams.Likers);
                users = users.Where(u => userLikees.Contains(u.Id));
            }

            if (userParams.MinAge != 18 || userParams.MaxAge != 99)
            {
                var minDoB = DateTime.Today.AddYears(-userParams.MaxAge - 1);
                var maxDoB = DateTime.Today.AddYears(-userParams.MinAge);

                users = users.Where(u => u.DateOfBirth >= minDoB && u.DateOfBirth <= maxDoB);

            }

            // sorting:
            if (string.IsNullOrEmpty(userParams.OrderBy)==false)
            {
                switch (userParams.OrderBy)
                {
                    case "created":
                        users = users.OrderByDescending(u => u.Created);
                        break;
                    default:
                        users = users.OrderByDescending(u => u.LastActive);
                        break;
                }

            }

            return await PagedList<User>.CreateAsync(users, userParams.PageNumber, userParams.PageSize);
        }

        private async Task<IEnumerable<int>> GetUserLikes(int id, bool likers)
        { // return either list of likers or likees as a list of ints.
            var user = await _context.Users
                .Include(x => x.Likers)
                .Include(x => x.Likees)
                .FirstOrDefaultAsync(u => u.Id == id);

            if (likers)
            {   // we don't want to return a list of users, but rather a list of ints corresponding to
                // like userIds, so we use the select function.
                return user.Likers.Where(u => u.LikeeId == id).Select(i => i.LikerId);
            }
            else
            {
                return user.Likees.Where(u => u.LikerId == id).Select(i => i.LikeeId);
            }
        }

        public async Task<bool> SaveAll()
        {
            // return true if changes have been made to the db.  
            return await _context.SaveChangesAsync() > 0;
        }

        public async Task<Message> GetMessage(int id)
        {
            return await _context.Messages.FirstOrDefaultAsync(m => m.Id == id);
        }

        //public async Task<PagedList<Message>> GetMessagesForUser(MessageParams messageParams)
        public async Task<IEnumerable<Message>> GetMessagesForUser(MessageParams messageParams)
        {
            var messages = await _context.Messages
                .Include(u => u.Sender).ThenInclude(p => p.Photos)
                .Include(u => u.Recipient).ThenInclude(p => p.Photos)
                .Where(m => m.RecipientId == messageParams.UserId && m.RecipientDeleted == false
                    || m.SenderId == messageParams.UserId && m.SenderDeleted == false)
                .Select(m => new
                    {
                        conversation = new
                        {
                            conversationId = m.RecipientId != messageParams.UserId ? m.RecipientId : m.SenderId
                        },
                        message = m
                    })
                .ToListAsync();

            var result = messages
                .GroupBy(l => l.conversation.conversationId)
                .Select(m => m.OrderByDescending(c => c.message.MessageSent).FirstOrDefault().message);


            //if (messageParams.MessageContainer == "Unread")
            //{
            //    result = result.Where(m => m.IsRead);

            //}

            //switch (messageParams.MessageContainer)
            //{
            //    case "Unread":
            //        result = messages
            //            .GroupBy(l => l.conversation.conversationId)
            //            .Select(m => m.OrderByDescending(c => c.message.MessageSent)
            //            .FirstOrDefault().message)
            //            .Where(u => u.IsRead == false);
            //        break;
            //    default:
            //        result = messages
            //            .GroupBy(l => l.conversation.conversationId)
            //            .Select(m => m.OrderByDescending(c => c.message.MessageSent)
            //            .FirstOrDefault().message)
            //        break;
            //}

            //    case "Inbox":
            //        messages = messages.Where(u => u.RecipientId == messageParams.UserId
            //            && u.RecipientDeleted == false);
            //        break;
            //    case "Outbox":
            //        messages = messages.Where(u => u.SenderId == messageParams.UserId
            //            && u.SenderDeleted == false);
            //        break;
            //    default:
            //        messages = messages.Where(u => u.RecipientId == messageParams.UserId
            //            && u.IsRead == false && u.RecipientDeleted == false);
            //        break;

            //messages = messages.OrderByDescending(d => d.MessageSent);

            //return await PagedList<Message>.CreateAsync(result,
            //    messageParams.PageNumber, messageParams.PageSize);

            return result.OrderByDescending(m => m.MessageSent);
        }

        public int GetNumberUnreadMessagesForUser(MessageParams messageParams)
        {
            var numberUnreadMessages = _context.Messages
                .Include(u => u.Sender).ThenInclude(p => p.Photos)
                .Include(u => u.Recipient).ThenInclude(p => p.Photos)
                .Where(u => u.RecipientId == messageParams.UserId
                        && u.IsRead == false && u.RecipientDeleted == false)
                .Count();

            return numberUnreadMessages;
        }

        public async Task<PagedList<Message>> GetMessageThread(int userId, int recipientId, MessageParams messageParams)
        {
            var messages = _context.Messages
                .Include(u => u.Sender).ThenInclude(p => p.Photos)
                .Include(u => u.Recipient).ThenInclude(p => p.Photos)
                .Where(m => m.RecipientId == userId && m.RecipientDeleted == false
                    && m.SenderId == recipientId
                    || m.RecipientId == recipientId && m.SenderId == userId
                    && m.SenderDeleted == false)
                //.OrderBy(m => m.MessageSent);
                .OrderByDescending(m => m.MessageSent);

            return await PagedList<Message>.CreateAsync(messages, messageParams.PageNumber, messageParams.PageSize);

        }

        public async Task<IEnumerable<Message>> GetMessageThreadForDeletion(int userId, int recipientId)
        {
            var messages = await _context.Messages
                .Where(m => m.RecipientId == userId && m.RecipientDeleted == false
                    && m.SenderId == recipientId
                    || m.RecipientId == recipientId && m.SenderId == userId
                    && m.SenderDeleted == false)
                .OrderBy(m => m.MessageSent)
                .ToListAsync();

                //.OrderBy(m => m.MessageSent);
                //.OrderByDescending(m => m.MessageSent)


            //var firstPage = (int)Math.Ceiling(messages.Count() / (double)messageParams.PageSize);


            //.ToListAsync();


            //return await PagedList<Message>.CreateAsync(messages, firstPage, messageParams.PageSize);
            return messages;

        }

        //public async Task<MessageThreadEnvelope> GetMessageThread(int userId, int recipientId, VerticalPaginationParams verticalPaginationParams)
        //{
        //    var messages = _context.Messages
        //        .Include(u => u.Sender).ThenInclude(p => p.Photos)
        //        .Include(u => u.Recipient).ThenInclude(p => p.Photos)
        //        .Where(m => m.RecipientId == userId && m.RecipientDeleted == false
        //            && m.SenderId == recipientId
        //            || m.RecipientId == recipientId && m.SenderId == userId
        //            && m.SenderDeleted == false)
        //        .OrderBy(m => m.MessageSent);

        //    var messageCount = messages.Count();

        //    var messagesToReturn = _mapper.Map<List<MessageToReturnDto>>(await messages
        //        .Skip(verticalPaginationParams.Offset ?? 0)
        //        .Take(verticalPaginationParams.Limit ?? 10)
        //        .ToListAsync());

        //    return new MessageThreadEnvelope
        //    {
        //        Messages = messagesToReturn,
        //        MessagesCount = messageCount
        //    };

        //    //var messages = await _context.Messages
        //    //    .Include(u => u.Sender).ThenInclude(p => p.Photos)
        //    //    .Include(u => u.Recipient).ThenInclude(p => p.Photos)
        //    //    .Where(m => m.RecipientId == userId && m.RecipientDeleted == false
        //    //        && m.SenderId == recipientId
        //    //        || m.RecipientId == recipientId && m.SenderId == userId
        //    //        && m.SenderDeleted == false)
        //    //    .OrderBy(m => m.MessageSent)
        //    //    .Skip(verticalPaginationParams.Offset ?? 0)
        //    //    .Take(verticalPaginationParams.Limit ?? 10)
        //    //    .ToListAsync();

        //    //var messagesToReturn = _mapper.Map<List<MessageToReturnDto>>(messages);

        //    //return new MessageThreadEnvelope
        //    //{
        //    //    Messages = messagesToReturn,
        //    //    MessagesCount = messagesToReturn.Count()
        //    //};

        //    //var totalMessages = messages.Count();

        //    //return await PagedList<Message>.CreateAsync(messages, messageParams.PageNumber, messageParams.PageSize);

        //    //return await PagedList<Message>.CreateAsync(result,
        //    //    messageParams.PageNumber, messageParams.PageSize);

        //    //return messagesPaged.ToList();

        //}

    }
}
