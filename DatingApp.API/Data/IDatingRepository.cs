using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using DatingApp.API.Helpers;
using DatingApp.API.Models;

namespace DatingApp.API.Data
{
    public interface IDatingRepository
    {
        void Add<T>(T entity) where T : class;
        void Delete<T>(T entity) where T : class;
        Task<bool> SaveAll();
        Task<PagedList<User>> GetUsers(UserParams userParams);
        Task<User> GetUser(int id, bool isCurrentUser);
        Task<Photo> GetPhoto(int id);
        Task<Photo> GetMainPhotoForUser(int userId);
        Task<Like> GetLike(int userId, int recipientId);
        Task<Message> GetMessage(int id);
        //Task<PagedList<Message>> GetMessagesForUser(MessageParams messageParams);
        Task<IEnumerable<Message>> GetMessagesForUser(MessageParams messageParams);
        Task<IEnumerable<Message>> GetMessageThreadForDeletion(int userId, int recipientId);
        Task<PagedList<Message>> GetMessageThread(int userId, int recipientId, MessageParams messageParams);
        int GetNumberUnreadMessagesForUser(MessageParams messageParams);
        //Task<MessageThreadEnvelope> GetMessageThread(int userId, int recipientId, VerticalPaginationParams verticalPaginationParams);

    }
}
