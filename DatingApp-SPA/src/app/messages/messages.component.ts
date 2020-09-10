import { Component, OnInit } from '@angular/core';
import { Message } from '../_models/message';
import { Pagination, PaginatedResult } from '../_models/Pagination';
import { UserService } from '../_services/user.service';
import { AuthService } from '../_services/auth.service';
import { ActivatedRoute } from '@angular/router';
import { AlertifyService } from '../_services/alertify.service';
import { User } from '../_models/user';

@Component({
  selector: 'app-messages',
  templateUrl: './messages.component.html',
  styleUrls: ['./messages.component.scss']
})
export class MessagesComponent implements OnInit {
  messages: Message[];
  userId: number;
  numberUnread: number;
  // pagination: Pagination;
  // messageContainer: 'Inbox';

  constructor(private userService: UserService, private authService: AuthService,
              private route: ActivatedRoute, private alertify: AlertifyService) { }

  ngOnInit(): void {
    if (this.authService.loggedIn()){
      const currentUserId = +this.authService.decodedToken.nameid;
      this.userId = currentUserId;

      this.route.data.subscribe(data => {
        // console.log(data);
        this.messages = data.messages.messages;
        this.numberUnread = data.messages.numberUnread;
        // this.pagination = data.messages.pagination;
      });
    }
  }

  // loadMessages(): any{
  //   this.userService.getMessages(this.authService.decodedToken.nameid,
  //     this.pagination.currentPage, this.pagination.itemsPerPage,
  //     this.messageContainer)
  //     .subscribe((res: PaginatedResult<Message[]>) => {
  //       this.messages = res.result;
  //       this.pagination = res.pagination;
  //     }, error => {
  //       this.alertify.error(error);
  //     });
  // }


  loadMessages(): any{
    this.userService.getMessages(this.userId)
      // this.messageContainer)
      .subscribe((res: Message[]) => {
        this.messages = res;
      }, error => {
        this.alertify.error(error);
      });
  }

  deleteConversation(recipientId: number, messageId: number): any{
    this.alertify.confirm('Are you sure you want to delete this conversation?', () => {
      this.userService.deleteMessageThread(this.userId, recipientId)
      .subscribe(() => {
        this.messages.splice(this.messages.findIndex(m => m.id === messageId), 1);
        this.alertify.success('Conversation has been deleted');
      }, error => {
        this.alertify.error('Failed to delete the conversation');
      });
    });
  }

  deleteMessage(id: number): any {
    this.alertify.confirm('Are you sure you want to delete this message?', () => {
      this.userService.deleteMessage(id, this.authService.decodedToken.nameid)
      .subscribe(() => {
        this.messages.splice(this.messages.findIndex(m => m.id === id), 1);
        this.alertify.success('Message has been deleted');
      }, error => {
        this.alertify.error('Failed to delete the message');
      });
    });
  }

  pageChanged(event: any): void{
    // this.pagination.currentPage = event.page;
    this.loadMessages();
  }

}
