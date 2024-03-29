import { Injectable, Output, EventEmitter } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { User } from '../_models/user';
import { Like } from '../_models/like';
import { Observable, BehaviorSubject } from 'rxjs';
import { PaginatedResult } from '../_models/Pagination';
import { map } from 'rxjs/operators';
import { Message } from '../_models/message';
import { HubConnection, HubConnectionBuilder } from '@microsoft/signalr';
import { ChatService } from './chat.service';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  baseUrl = environment.apiUrl;
  hubConnection: HubConnection | null = null;
  messagesTabActive = new BehaviorSubject<boolean>(false);

  constructor(private http: HttpClient, private chat: ChatService) { }

  changeUserDetailedTab(tab: number): void{
    const messagesTab = 3;
    // this.messagesTabActive.next(tab === messagesTab);
    this.messagesTabActive.next(tab === messagesTab);
    // console.log(tab);
    // console.log(this.messagesTabActive);
  }

  getUsers(page?, itemsPerPage?, userParams?, likesParam?): Observable<PaginatedResult<User[]>> {
    const paginatedResult: PaginatedResult<User[]> = new PaginatedResult<User[]>();
    let params = new HttpParams();

    if (page != null && itemsPerPage != null){
      params = params.append('pageNumber', page);
      params = params.append('pageSize', itemsPerPage);
    }

    if (userParams != null) {
      params = params.append('minAge', userParams.minAge);
      params = params.append('maxAge', userParams.maxAge);
      params = params.append('gender', userParams.gender);
      params = params.append('orderBy', userParams.orderBy);
    }

    if (likesParam === 'Likers'){
      params = params.append('likers', 'true');
    }
    if (likesParam === 'Likees'){
      params = params.append('likees', 'true');
    }


    return this.http.get<User[]>(this.baseUrl + 'users', {observe: 'response', params})
      .pipe(
        map(response => {
          paginatedResult.result = response.body;
          if (response.headers.get('Pagination') != null) {
            paginatedResult.pagination = JSON.parse(response.headers.get('Pagination'));
          }
          return paginatedResult;
        })
      );
  }

  getUser(id: number): Observable<User> {
    return this.http.get<User>(this.baseUrl + 'users/' + id);
  }

  updateUser(id: number, user: User): any{
    return this.http.put(this.baseUrl + 'users/' + id, user);
  }

  setMainPhoto(userId: number, id: number): any{
    return this.http.post(this.baseUrl + 'users/' + userId + '/photos/' + id + '/setMain', {});
  }

  deletePhoto(userId: number, id: number): any{
    return this.http.delete(this.baseUrl + 'users/' + userId + '/photos/' + id);
  }

  sendLikeUnlike(id: number, recipientId: number): any{
    return this.http.post(this.baseUrl + 'users/' + id + '/likeunlike/' + recipientId, {});
  }

  getMessages(id: number, messageContainer?): any{
    // let params = new HttpParams();

    // params = params.append('MessageContainer', messageContainer);

    return this.http.get<Message[]>(this.baseUrl + 'users/' + id + '/messages');
  }

  // getMessageThread(id: number, recipientId: number, page?, itemsPerPage?, messageContainer?): any{
  getMessageThread(id: number, recipientId: number, page?, itemsPerPage?, messageContainer?): Observable<PaginatedResult<Message[]>> {
    const paginatedResult: PaginatedResult<Message[]> = new PaginatedResult<Message[]>();
    let params = new HttpParams();
    // const paginatedResult: PaginatedResult<Message[]> = new PaginatedResult<Message[]>();
    // let params = new HttpParams();
    if (page != null && itemsPerPage != null){
      params = params.append('pageNumber', page);
      params = params.append('pageSize', itemsPerPage);
    }
    return this.http.get<Message[]>(this.baseUrl + 'users/' + id + '/messages/thread/' + recipientId, {observe: 'response', params})
      .pipe(
        map(response => {
          paginatedResult.result = response.body;
          if (response.headers.get('Pagination') != null) {
            paginatedResult.pagination = JSON.parse(response.headers.get('Pagination'));
          }
          return paginatedResult;
        })
      );
  }

  deleteMessageThread(userId: number, recipientId: number): any{
    return this.http.post(this.baseUrl + 'users/' + userId + '/messages/deleteThread/' + recipientId, {});
  }

  sendMessage(id: number, message: Message): any{
    return this.http.post(this.baseUrl + 'users/' + id + '/messages', message);
  }

  deleteMessage(id: number, userId: number): any{
    return this.http.post(this.baseUrl + 'users/' + userId + '/messages/' + id, {});
  }

  markAsRead(userId: number, messageId: number): any{
    this.http.post(this.baseUrl + 'users/' + userId + '/messages/' + messageId + '/read', {})
    .subscribe(next =>  this.chat.markAsRead(userId, messageId));
  }

  goOffline(userId: number): any{
    return this.http.post(this.baseUrl + 'users/' + userId + '/gooffline', {});
  }

}
