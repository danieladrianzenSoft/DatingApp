import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { Message } from 'src/app/_models/message';
import { UserService } from 'src/app/_services/user.service';
import { AuthService } from 'src/app/_services/auth.service';
import { AlertifyService } from 'src/app/_services/alertify.service';
import { tap } from 'rxjs/operators';

@Component({
  selector: 'app-member-messages',
  templateUrl: './member-messages.component.html',
  styleUrls: ['./member-messages.component.scss']
})
export class MemberMessagesComponent implements OnInit {
  @Input() recipientId: number;
  messages: Message[];
  newMessage: any = {};
  chat: any;

  constructor(private userService: UserService,
              private authService: AuthService,
              private alertify: AlertifyService)
              {}

  ngOnInit(): void {
    this.loadMessages();
    // this.chat = document.getElementById('message-thread');
    // this.chat.nativeElement.scrollTop = this.chat.nativeElement.scrollHeight;
  }

  loadMessages(): any{
    const currentUserId = +this.authService.decodedToken.nameid;
    this.userService.getMessageThread(this.authService.decodedToken.nameid, this.recipientId)
      .pipe(
        tap((messages: Message[]) => {
          // tslint:disable-next-line: prefer-for-of
          for (let i = 0; i < messages.length; i++){
            // if (message.isRead === false && message.recipientId === currentUserId){
            //   this.userService.markAsRead(currentUserId, message.id);
            // }
            if (messages[i].isRead === false && messages[i].recipientId === currentUserId){
              this.userService.markAsRead(currentUserId, messages[i].id);
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

  sendMessage(): any{
    this.newMessage.recipientId = this.recipientId;
    this.userService
      .sendMessage(this.authService.decodedToken.nameid, this.newMessage)
      .subscribe(
        (message: Message) => {
          // we want to add the message to the start, not the end, so we can use unshift.
          this.messages.push(message);
          this.newMessage.content = '';
          // this.chat.nativeElement.scrollTop = this.chat.nativeElement.scrollHeight;
        }, error => {
        this.alertify.error(error);
      });
  }

}
