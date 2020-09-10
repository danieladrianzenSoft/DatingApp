import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators, FormBuilder, AsyncValidatorFn } from '@angular/forms';
import { ActivatedRouteSnapshot, Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../_services/auth.service';
import { AlertifyService } from '../../_services/alertify.service';

function matchingPasswords(password: string, confirmPassword: string): any{
  return (group: FormGroup) => {
    const passwordInput = group.controls[password];
    const passwordConfirmationInput = group.controls[confirmPassword];
    if (passwordInput.value !== passwordConfirmationInput.value) {
      return passwordConfirmationInput.setErrors({mismatch: true});
    }
  };
}

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss']
})
export class ResetPasswordComponent implements OnInit {
  resetPasswordForm: FormGroup;
  formCompleted = false;
  resetPasswordInfo: any = {};
  errors: string[];
  email: string;
  token: string;
  showPasswordResetSuccessfully = false;

  constructor(private fb: FormBuilder, private route: ActivatedRoute, private router: Router,
              private authService: AuthService, private alertify: AlertifyService) { }

  ngOnInit(): void {
    this.createResetPasswordForm();
    this.route.queryParams
    .subscribe(params => {
      this.email = params.email;
      this.token = params.token; // popular
    }
  );
  }

  createResetPasswordForm(): any{
    this.resetPasswordForm = this.fb.group({
      password: ['', [Validators.required, Validators.minLength(4), Validators.maxLength(8)]],
      confirmPassword: ['', Validators.required]
    }, { validators: matchingPasswords('password', 'confirmPassword')});
    // , {validator: this.passwordMatchValidator});
    // {validator: this.passwordMatchValidator});
  }
  resetPassword(): any{
    this.formCompleted = true;
    if (this.resetPasswordForm.valid) {
      this.resetPasswordInfo = Object.assign({},
        {email: this.email,
        token: this.token,
        password: this.resetPasswordForm.get('password').value});
      this.authService.resetPassword(this.resetPasswordInfo).subscribe(next => {
        this.alertify.success('Password reset successful');
        this.formCompleted = true;
        this.showPasswordResetSuccessfully = true;
      }, error => {
        this.alertify.error(error);
        this.errors = error.errors;
        this.router.navigate(['/login']);
      });
      // this.authService.register(this.user).subscribe(() => {
      //   this.alertify.success('Registration successful');
      // }, error => {
      //   this.errors = error.errors;
      //   this.alertify.error(error);

      //  }, () => {
        // automatically log users in after registering, if successful.
          // this.authService.login(this.user).subscribe(() => {
          // this.router.navigate(['/awaiting-email-verification']);
    }
  }

}
