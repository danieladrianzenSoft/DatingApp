import { Component, OnInit, Input } from '@angular/core';
import { AuthService } from 'src/app/_services/auth.service';
import { AlertifyService } from 'src/app/_services/alertify.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-awaiting-email-verification',
  templateUrl: './awaiting-email-verification.component.html',
  styleUrls: ['./awaiting-email-verification.component.scss'],
  // viewProviders: [{provide: ControlContainer, useExisting: NgForm}]
})
export class AwaitingEmailVerificationComponent implements OnInit {
  @Input() loginInfo: any = {};

  constructor(private authService: AuthService, private alertify: AlertifyService,
              private router: Router) { }

  ngOnInit(): void {
    // this.model = this.fb.group({
    //   username: '',
    //   password: ''
    // });
  }

  sendLink(): void{
    this.authService.sendEmailVerification(this.loginInfo).subscribe(data => {
      this.alertify.success('Email sent');
    }, error => {
      this.alertify.error(error);
    }
    );
  }

}
