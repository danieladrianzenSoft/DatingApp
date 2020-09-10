import { Component, OnInit, Input } from '@angular/core';
import { AuthService } from '../../_services/auth.service';
import { AlertifyService } from '../../_services/alertify.service';
import { Router, ActivatedRoute } from '@angular/router';
import { BusyService } from 'src/app/_services/busy.service';

@Component({
  selector: 'app-confirm-email',
  templateUrl: './confirm-email.html',
  styleUrls: ['./confirm-email.scss']
})
export class ConfirmEmailComponent implements OnInit {
userId: string;
token: string;
isVerified: boolean;

  constructor(public authService: AuthService, private alertify: AlertifyService,
              private route: ActivatedRoute, private router: Router,
              private busyService: BusyService) { }

  ngOnInit(): void {
    // this.busyService.busy();
    this.route.data.subscribe(data => {
      // this.busyService.idle();
      this.isVerified = data.isVerified;
      this.alertify.success('Your email has been successfully verified');
    }, error => {
      this.alertify.error(error);
    });
  }
}
