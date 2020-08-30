import { Component, OnInit, Input, ViewChild, HostListener, Inject, AfterViewChecked, ElementRef, NgZone, ComponentFactoryResolver } from '@angular/core';
import { Message } from 'src/app/_models/message';
import { UserService } from 'src/app/_services/user.service';
import { AuthService } from 'src/app/_services/auth.service';
import { AlertifyService } from 'src/app/_services/alertify.service';
import { HubConnection, HubConnectionBuilder } from '@microsoft/signalr';
import { ChatService } from 'src/app/_services/chat.service';
import { tap, catchError } from 'rxjs/operators';
import { User } from 'src/app/_models/user';
import { Router } from '@angular/router';
import { of } from 'rxjs';
// import { DOCUMENT } from '@angular/common';

@Component({
  selector: 'app-member-messages',
  templateUrl: './member-messages.component.html',
  styleUrls: ['./member-messages.component.scss']
})
export class MemberMessagesComponent implements OnInit, AfterViewChecked{
  @Input() recipient: User;
  @ViewChild('messageThread') private messageThreadContainer: ElementRef;
  messages: Message[];
  newMessageToSend: any = {};
  newMessageReceived: any = {};
  hubConnection: HubConnection | null = null;
  messageThread: Message[];
  userId: number;
  user: User;
  recipientId: number;
  // currentUserId: number;
  // scrollMaxHeight: number;

  constructor(private userService: UserService,
              private authService: AuthService,
              private alertify: AlertifyService,
              private chat: ChatService,
              private router: Router)
              // private ngZone: NgZone)
              {
                // this.loadMessages();
                // this.receiveMessages();
              }

  ngOnInit(): void {
    const currentUserId = +this.authService.decodedToken.nameid;
    this.userId = currentUserId;
    this.userService.getUser(this.authService.decodedToken.nameid)
      .subscribe(user => {
        this.user = user;
      }, error => {
        this.alertify.error('Problem retrieving your data');
      });
    this.recipientId = this.recipient.id;
    this.userService.getMessages(this.authService.decodedToken.nameid)
    .subscribe(data => {
      this.chat.createHubConnection(this.authService.decodedToken.nameid);
      this.chat.setInitialNewMessagesCounter(data.numberUnread);
      this.loadMessages(currentUserId);
      // this.chat.startConnection(this.authService.decodedToken.nameid);
    });
    this.receiveMessages();

  }

  ngAfterViewChecked(): void{
    this.scrollToBottom();
  }

  scrollToBottom(): void {
    try {
        this.messageThreadContainer.nativeElement.scrollTop = this.messageThreadContainer.nativeElement.scrollHeight;
    } catch (err) { }
  }

  sendMessage(): any{
    this.newMessageToSend.recipientId = this.recipientId;
    this.chat.sendMessage(this.userId, this.newMessageToSend);
    // this.newMessageToSend.senderId = this.userId;

    // this.newMessageToSend.senderDisplayName = this.user.displayName;
    // this.newMessageToSend.recipientId = this.recipientId;
    // this.newMessageToSend.recipientDisplayName = this.recipient.displayName;
    // this.newMessageToSend.messageSent = new Date();
    // this.newMessageToSend.isRead = false;
    // this.messages.push(this.newMessageToSend);
    // this.chat.sendMessage(this.userId, this.newMessageToSend);
    this.newMessageToSend = {};
    // this.loadMessages();
    // this.messages.push(this.newMessage);
    // this.newMessageToSend.content = '';
  }

  private receiveMessages(): void {
    this.chat.messageReceived.subscribe((newMessageReceived: Message) => {
      this.messages.push(newMessageReceived);
      // if (newMessageReceived.senderId === this.userId){
      //   this.chat.markAsRead(this.userId, newMessageReceived.id);
      // }
      // this.alertify.message(newMessageReceived.recipientDisplayName);
      // this.newMessage.content = '';
      // this.alertify.success(message.content);
      // this.loadMessages();
      // this.ngZone.run(() => {
      //   if (this.newMessage.senderId !== this.userId) {
      //     this.newMessage.isRead = true;
      //     this.messages.push(this.newMessage);
      //   }
      });
    // });
  }

  loadMessages(currentUserId): any{
    // this.userId = currentUserId;
    this.userService.getMessageThread(this.authService.decodedToken.nameid, this.recipientId)
      .pipe(
        tap((messages: Message[]) => {
          // tslint:disable-next-line: prefer-for-of
          for (let i = 0; i < messages.length; i++){
            if (messages[i].isRead === false && messages[i].recipientId === currentUserId){
              this.userService.markAsRead(currentUserId, messages[i].id);
              this.chat.markAsRead(currentUserId, messages[i].id);
              this.chat.updateNewMessagesCounter(-1);
              // this.chat.markAsRead(currentUserId, messages[i].id);
            }

          }
        })
      )
      .subscribe(messages => {
        this.messages = messages;
        // this.chat.nativeElement.scrollTop = this.chat.nativeElement.scrollHeight;
      }, error => {
        this.alertify.error(error);
      });
  }

  // sendMessage(): any{
  //   this.newMessage.recipientId = this.recipientId;
  //   this.userService
  //     .sendMessage(this.authService.decodedToken.nameid, this.newMessage)
  //     .subscribe(
  //       (message: Message) => {
  //         // we want to add the message to the start, not the end, so we can use unshift.
  //         this.messages.push(message);
  //         this.newMessage.content = '';
  //         // this.chat.nativeElement.scrollTop = this.chat.nativeElement.scrollHeight;
  //       }, error => {
  //       this.alertify.error(error);
  //     });
  // }

}
