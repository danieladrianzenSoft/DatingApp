import { Component, OnInit, Input } from '@angular/core';
import { AuthService } from 'src/app/_services/auth.service';
import { AlertifyService } from 'src/app/_services/alertify.service';
import { Router } from '@angular/router';
import { ControlContainer, NgForm } from '@angular/forms';

@Component({
  selector: 'app-awaiting-email-verification',
  templateUrl: './awaiting-email-verification.component.html',
  styleUrls: ['./awaiting-email-verification.component.scss'],
  // viewProviders: [{provide: ControlContainer, useExisting: NgForm}]
})
export class AwaitingEmailVerificationComponent implements OnInit {
  @Input() model: any;

  constructor(private authService: AuthService, private alertify: AlertifyService,
              private router: Router, private controlContainer: ControlContainer) { }

  ngOnInit(): void {
  }

  sendLink(): void{
    this.authService.sendEmailVerification(this.model).subscribe(data => {
      this.alertify.success('Email sent');
    }, error => {
      this.alertify.error(error);
    }
    );
  }

}
