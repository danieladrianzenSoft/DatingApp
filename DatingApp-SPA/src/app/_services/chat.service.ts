import { Injectable, EventEmitter, Input } from '@angular/core';
import { Message } from '../_models/message';
import { HubConnection, HubConnectionBuilder, HttpTransportType, LogLevel, HubConnectionState } from '@microsoft/signalr';
import { environment } from 'src/environments/environment';
import { AuthService } from './auth.service';
import { UserService } from './user.service';
import { tap } from 'rxjs/operators';
import { HttpHeaders } from '@angular/common/http';
import { Subscription, BehaviorSubject, Observable } from 'rxjs';
import { AlertifyService } from './alertify.service';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  baseUrl = environment.apiUrl;
  // currentId: number;
  newMessagesCounter: number;
  newMessagesCounterUpdate = new EventEmitter<number>();
  // messages = new EventEmitter<Message[]>();
  messageReceived = new EventEmitter<Message>();
  isConnected = false;

  // private headers: HttpHeaders | null = null;
  private hubConnection: HubConnection | null = null;

  // isAuthorizedSubscription: Subscription | undefined;
  // isAuthorized = false;

  constructor(private alertify: AlertifyService) {}

    setInitialNewMessagesCounter(numberUnread: number): void{
      this.newMessagesCounter = numberUnread;
      this.newMessagesCounterUpdate.emit(this.newMessagesCounter);
      // console.log(this.newMessagesCounter);
    }

    updateNewMessagesCounter(modifier: number): void{
      this.newMessagesCounter += modifier;
      if (this.newMessagesCounter < 0) {
        this.newMessagesCounter = 0;
      }
      this.newMessagesCounterUpdate.emit(this.newMessagesCounter);
      // console.log(this.newMessagesCounter);
    }

    resetNewMessagesCounter(): void{
      this.newMessagesCounter = 0;
      this.newMessagesCounterUpdate.emit(this.newMessagesCounter);
    }

    createHubConnection = (currentUserId) => {
      if (this.hubConnection){
        this.stopHubConnection(currentUserId);
      }
      this.hubConnection = new HubConnectionBuilder()
        .withUrl(this.baseUrl + 'chat', {
          accessTokenFactory: () => localStorage.getItem('token')
        })
        .configureLogging(LogLevel.None)
        // .configureLogging(LogLevel.Information)
        .build();
      this.startConnection(currentUserId);
      // }
   }

    startConnection(currentUserId): void {
      // if (this.hubConnection) {
        this.hubConnection
        .start()
        .then(() => {
          console.log(this.hubConnection.state);
        })
        .then(() => {
          console.log('Attempting to join group');
          this.hubConnection.invoke('AddToGroup', currentUserId)
            .catch(err => {
              // console.error(err);
            });
        })
        .catch(err => {
          // console.error('Error while establishing connection, retrying...');
          // console.error(err);
          // setTimeout(function(): void { this.createHubConnection(currentUserId); }, 5000);
        });
      // }
      // else{
      //   this.alertify.success('already connected');
      // }
        this.hubConnection.on('ReceiveMessage', message => {
          this.messageReceived.emit(message);
          if (message.recipientId.toString() === currentUserId){
            this.updateNewMessagesCounter(1);
            // this.newMessagesCounterUpdate.emit(this.newMessagesCounter);
          }
          // console.log(message.recipientId.toString(), message.senderId.toString(), currentUserId);
          // console.log(currentUserId);
          // console.log(this.newMessagesCounter);
          // this.newMessagesCounterUpdate.emit(this.newMessagesCounter);
        });
      }
      // else{
      //   this.createHubConnection(currentUserId);
      // }
    // }

    markAsRead(currentUserId, id: number): void{
      // if (this.hubConnection && this.hubConnection.state === 'Connected'){
        this.hubConnection.invoke('MarkAsRead', currentUserId, id)
        .then(() => {
          // this.updateNewMessagesCounter(-1);
        })
        .catch(error => {
          // console.error(error);
        });
      // }
    }

    sendMessage(currentUserId, message: Message): void{
      this.hubConnection.invoke('SendMessage', currentUserId, message)
        .catch(error => console.error(error))
        .then(() => {
          this.updateNewMessagesCounter(0);
        });
      // this.newMessagesCounterUpdate.emit(this.newMessagesCounter);
    }

    stopHubConnection = (currentUserId) => {
      // this.hubConnection.invoke('RemoveFromGroup', currentUserId)
        // .then(() => {
          if (this.hubConnection) {
            this.hubConnection.stop()
            // .then(() => this.postIsConnected(false))
            // .then(() => this.alertify.success(this.hubConnection.state))
            .catch(error => this.alertify.error(error));
          }

        // })
        // .catch(error => console.error(error));
    }
  }

//     // loadMessages(): any{
//     //   const currentUserId = +this.authService.decodedToken.nameid;
//     //   this.userService.getMessageThread(currentUserId, this.recipientId)
//     //     .pipe(
//     //       tap((messages: Message[]) => {
//     //         // tslint:disable-next-line: prefer-for-of
//     //         for (let i = 0; i < messages.length; i++){
//     //           // if (message.isRead === false && message.recipientId === currentUserId){
//     //           //   this.userService.markAsRead(currentUserId, message.id);
//     //           // }
//     //           if (messages[i].isRead === false && messages[i].recipientId === currentUserId){
//     //             this.userService.markAsRead(currentUserId, messages[i].id);
//     //           }

//     //         }
//     //       })
//     //     )
//     //     .subscribe(messages => {
//     //       // this.chat.nativeElement.scrollTop = this.chat.nativeElement.scrollHeight;
//     //     }, error => {
//     //       console.log(error);
//     //     });
//     // }
//
