import { Component, OnInit, Input, ViewChild, AfterViewChecked, ElementRef, SimpleChanges } from '@angular/core';
import { Message } from 'src/app/_models/message';
import { UserService } from 'src/app/_services/user.service';
import { AuthService } from 'src/app/_services/auth.service';
import { AlertifyService } from 'src/app/_services/alertify.service';
import { HubConnection } from '@microsoft/signalr';
import { ChatService } from 'src/app/_services/chat.service';
import { tap } from 'rxjs/operators';
import { User } from 'src/app/_models/user';
import { Router } from '@angular/router';
import { Pagination, PaginatedResult } from 'src/app/_models/Pagination';
import { BehaviorSubject } from 'rxjs';
import { formatWithOptions } from 'util';

const groupMap: Map<Date, Message[]> = new Map<Date, Message[]>();

@Component({
  selector: 'app-member-messages',
  templateUrl: './member-messages.component.html',
  styleUrls: ['./member-messages.component.scss'],
})

export class MemberMessagesComponent implements OnInit, AfterViewChecked {
  @Input() recipient: User;
  @ViewChild('messageThread') private messageThreadContainer: ElementRef;
  messages: Message[];
  newMessageToSend: any = {};
  // newMessageReceived: any = {};
  scrollSuccessfull = false;
  hubConnection: HubConnection | null = null;
  // messageThread: Message[];
  messagesCount: number;
  userId: number;
  user: User;
  recipientId: number;
  pagination: Pagination;
  pageNumber = 1;
  pageSize = 15;
  groupedMessages: any;
  messagingTabActive: boolean;
  newMessagesStartingIndex: number;


  // currentUserId: number;
  // scrollMaxHeight: number;

  constructor(private userService: UserService,
              private authService: AuthService,
              private alertify: AlertifyService,
              private chat: ChatService,
              private router: Router)
              {}

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
    // this.userService.messagesTabActive.subscribe(active => {
    //     this.messagingTabActive = active;
    // });
    this.userService.getMessages(this.authService.decodedToken.nameid)
      .subscribe((data) => {
        this.chat.createHubConnection(this.authService.decodedToken.nameid);
        this.chat.setInitialNewMessagesCounter(data.numberUnread);
        this.loadMessages(currentUserId);
        // this.userService.messagesTabActive.subscribe(active => {
          // this.messagingActive = active;
        // if (this.messagingActive){
        // }
        // });
        // this.chat.startConnection(this.authService.decodedToken.nameid);
    });
    this.receiveMessages();
  }

  setPage = (pageNumber: number) => {
    this.pageNumber = pageNumber;
  }

  ngAfterViewChecked(): void{
    if (this.scrollSuccessfull === false){
      this.scrollSuccessfull = this.scrollToBottom(this.messageThreadContainer);
    }
  }

  scrollToBottom(element: ElementRef): boolean {
    // try {
      if (element) {
        this.messageThreadContainer.nativeElement.scrollTop = this.messageThreadContainer.nativeElement.scrollHeight;
        return element.nativeElement.scrollTop !== 0;
      }
      return false;
    // } catch (err) { return false; }
  }

  sendMessage(): any{
    this.newMessageToSend.recipientId = this.recipientId;
    this.chat.sendMessage(this.userId, this.newMessageToSend);
    this.newMessageToSend = {};
  }

  private receiveMessages(): void {
    this.chat.messageReceived.subscribe((newMessageReceived: Message) => {
      if (newMessageReceived.recipientId === this.recipientId || newMessageReceived.senderId === this.recipientId){
          this.messages.push(newMessageReceived);
          console.log(newMessageReceived.recipientId === this.recipientId);
          this.groupedMessages = this.groupByDate(this.messages);
          this.scrollSuccessfull = false;
          this.scrollToBottom(this.messageThreadContainer);
         }
    }, error => {
      console.error(error);
    });
    // });
  }

  loadMessages(currentUserId): any{
    // this.userId = currentUserId;
    this.userService.getMessageThread(this.authService.decodedToken.nameid, this.recipientId,
      this.pageNumber, this.pageSize)
      .pipe(
        tap((messages: PaginatedResult<Message[]>) => {
          // tslint:disable-next-line: prefer-for-of
            for (let i = 0; i < messages.result.length; i++) {
              if (messages.result[i].isRead === false && messages.result[i].recipientId === currentUserId){
                  this.userService.markAsRead(currentUserId, messages.result[i].id);
                  this.chat.markAsRead(currentUserId, messages.result[i].id);
                  this.chat.updateNewMessagesCounter(-1);
                  // this.chat.markAsRead(currentUserId, messages[i].id);
              }
            }
          // tslint:disable-next-line: prefer-for-of
          // for (let i = 0; i < messages.result.length; i++) {
          //   if (messages.result[i].isRead === false && messages.result[i].recipientId === currentUserId){
          //       this.userService.markAsRead(currentUserId, messages.result[i].id);
          //       this.chat.markAsRead(currentUserId, messages.result[i].id);
          //       // if (this.messagingActive){
          //       this.chat.updateNewMessagesCounter(-1);
          //       // }

          //               // this.chat.markAsRead(currentUserId, messages[i].id);
          //   }
          //   // }

          // }
            this.newMessagesStartingIndex = messages.result.length;
          })
        )
      .subscribe(messages => {
        if (this.messages){
          // tslint:disable-next-line: prefer-for-of
          for (let i = messages.result.length - 1; i >= 0; i--){
            this.messages.unshift(messages.result[i]);
          }
        }
        else{
          this.messages = messages.result;
        }
        this.groupedMessages = this.groupByDate(this.messages);
        }, error => {
          this.alertify.error(error);
        });
  }

  groupByDate(messages: Message[]): any{
    // const sortedMessages = messages;
    return Object.entries(messages.reduce((groupedMessages, message) => {
      const date = message.messageSent.toString().split('T')[0];
      groupedMessages[date] = groupedMessages[date] ? [...groupedMessages[date], message] : [message];
      return groupedMessages;
    }, {}));
  }

  onScrollUp(): any {
    // console.log('scrolled up!!');
    this.pageNumber += 1;
    // console.log(this.pageNumber);
    this.loadMessages(this.userId);
  }

  resetNewMessagesCounterForThread(currentUserId): any{
    for (let i = this.newMessagesStartingIndex; i < this.messages.length; i++){
      if (this.messages[i].isRead === false && this.messages[i].recipientId === currentUserId){
        this.userService.markAsRead(currentUserId, this.messages[i].id);
        this.chat.markAsRead(currentUserId, this.messages[i].id);
        this.chat.updateNewMessagesCounter(-1);
      }
    }
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
