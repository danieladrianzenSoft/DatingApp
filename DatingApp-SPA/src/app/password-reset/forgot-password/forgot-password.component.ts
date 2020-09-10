import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { AuthService } from 'src/app/_services/auth.service';
import { AlertifyService } from 'src/app/_services/alertify.service';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss']
})
export class ForgotPasswordComponent implements OnInit {
  model: any = {};
  loading = false;
  showAwaitingVerification = false;

  @Output() showForgotPassword: EventEmitter<boolean> = new EventEmitter<boolean>();

  constructor(private authService: AuthService, private alertify: AlertifyService) { }

  ngOnInit(): void {
  }

  sendForgotPasswordLink(): any{
    this.loading = true;
    this.model = Object.assign({}, {email: this.model.email});
    this.authService.sendForgotPasswordLink(this.model).subscribe( next => {
      this.alertify.success('Password reset link sent');
      this.loading = false;
      this.showAwaitingVerification = true;
    }, error => {
      this.alertify.error(error);
      console.error(error);
    });
  }
  cancel(): void{
    this.showForgotPassword.emit(false);
  }

  // login(): any{
  //   this.loginInfo = Object.assign({}, {username: this.model.username, password: this.model.password});
  //   this.authService.login(this.model).subscribe( next => {
  //     this.alertify.success('Logged in successfully');
  //     this.authService.unverifiedAccount.next(false);
  //   }, error => {
  //     this.alertify.error(error);
  //   }, () => {
  //     this.router.navigate(['/members']);
  //     this.userService.getMessages(this.authService.decodedToken.nameid)
  //     .subscribe(data => {
  //       this.chat.createHubConnection(this.authService.decodedToken.nameid);
  //       // this.chat.startConnection(this.authService.decodedToken.nameid);
  //       this.chat.setInitialNewMessagesCounter(data.numberUnread);
  //     });
  //   });
  //   // login method returns an observable, and we always need to subscribe
  //   // to observables.
  // }

}
