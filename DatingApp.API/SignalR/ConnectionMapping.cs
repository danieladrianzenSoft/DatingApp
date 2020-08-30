using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Linq;
using DatingApp.API.Dtos;

namespace DatingApp.API.SignalR
{
    public class ConnectionMapping<T>
    {
        private readonly Dictionary<T, HashSet<string>> _connections =
            new Dictionary<T, HashSet<string>>();

        public int Count
        {
            get
            {
                return _connections.Count;
            }
        }

        public void Add(T key, string connectionId)
        {
            lock (_connections)
            {
                HashSet<string> connections;
                if (!_connections.TryGetValue(key, out connections))
                {
                    connections = new HashSet<string>();
                    _connections.Add(key, connections);
                }

                lock (connections)
                {
                    connections.Add(connectionId);
                }
            }
        }

        public IEnumerable<string> GetConnections(T key)
        {
            HashSet<string> connections;
            if (_connections.TryGetValue(key, out connections))
            {
                return connections;
            }

            return Enumerable.Empty<string>();
        }

        public void Remove(T key, string connectionId)
        {
            lock (_connections)
            {
                HashSet<string> connections;
                if (!_connections.TryGetValue(key, out connections))
                {
                    return;
                }

                lock (connections)
                {
                    connections.Remove(connectionId);

                    if (connections.Count == 0)
                    {
                        _connections.Remove(key);
                    }
                }
            }
        }
        //private ConcurrentDictionary<string, UserForChatDto> _onlineUser { get; set; }
        //    = new ConcurrentDictionary<string, UserForChatDto>();

        //public bool AddUpdate(string username, string connectionId)
        //{
        //    var userAlreadyExists = _onlineUser.ContainsKey(username);

        //    var userForChatDto = new UserForChatDto
        //    {
        //        Username = username,
        //        ConnectionId = connectionId,
        //    };

        //    _onlineUser.AddOrUpdate(username, userForChatDto, (key, value) => userForChatDto);

        //    return userAlreadyExists;
        //}

        //public void Remove(string username)
        //{
        //    UserForChatDto userForChatDto;
        //    _onlineUser.TryRemove(username, out userForChatDto);
        //}

        //public IEnumerable<UserForChatDto> GetAllUsersExceptThis(string username)
        //{
        //    return _onlineUser.Values.Where(item => item.Username != username);
        //}

        //public UserForChatDto GetUserInfo(string username)
        //{
        //    UserForChatDto user;
        //    _onlineUser.TryGetValue(username, out user);
        //    return user;
        //}
    }
}
