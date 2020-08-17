import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { AuthService } from '../_services/auth.service';
import { AlertifyService } from '../_services/alertify.service';
import { FormGroup, Validators, FormBuilder, AsyncValidatorFn } from '@angular/forms';
import { User } from '../_models/user';
import { Router } from '@angular/router';
import { timer, of } from 'rxjs';
import { switchMap, map } from 'rxjs/operators';
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';

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
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})

export class RegisterComponent implements OnInit {
  // @Output() cancelRegister = new EventEmitter();
  user: User;
  registerForm: FormGroup;
  bsConfig: Partial<BsDatepickerConfig>;
  errors: string[];
  registrationCompleted = false;
  loginInfo: any = {};

  constructor(private authService: AuthService, private alertify: AlertifyService,
              private fb: FormBuilder, private router: Router) { }

  ngOnInit(): void {
    this.bsConfig = {
      containerClass: 'theme-red'
    };
    this.createRegisterForm();
    // this.passwordMatchValidator();
  }

  createRegisterForm(): any{
    this.registerForm = this.fb.group({
      gender: ['male'],
      username: ['', Validators.required],
      email: ['', [Validators.required,
        Validators.pattern('^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$')],
        [this.validateEmailNotTaken()]],
      displayName: ['', Validators.required],
      dateOfBirth: ['', Validators.required],
      city: ['', Validators.required],
      country: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(4), Validators.maxLength(8)]],
      confirmPassword: ['', Validators.required]
    }, { validators: matchingPasswords('password', 'confirmPassword')});
    // , {validator: this.passwordMatchValidator});
    // {validator: this.passwordMatchValidator});
  }



  // passwordMatchValidator(g: FormGroup): any{
  //   return g.get('password').value === g.get('confirmPassword').value ? null : {mismatch: true};
  // }

  // passwordMatchValidator(password, confirmPassword): any{
  //   return password === confirmPassword ? null : {mismatch: true};
  // }

  register(): any{
    this.registrationCompleted = true;
    if (this.registerForm.valid) {
      // cloning values from form into an empty object, and assign it to this.user
      // which is of type user.
      this.user = Object.assign({}, this.registerForm.value);
      this.loginInfo = Object.assign({},
        {username: this.registerForm.get('username').value,
        password: this.registerForm.get('password').value});
      this.authService.register(this.user).subscribe(() => {
        this.alertify.success('Registration successful');
      }, error => {
        this.errors = error.errors;
        this.alertify.error(error);

      //  }, () => {
        // automatically log users in after registering, if successful.
          // this.authService.login(this.user).subscribe(() => {
          // this.router.navigate(['/awaiting-email-verification']);
      });
    }
  }
    validateEmailNotTaken(): AsyncValidatorFn {
      // this will validate the email asynchronously.
      return control => {
        return timer(500).pipe(
          // want to return inner observable to outer observable. SwitchMap will allow
          // us to do this.
          switchMap(() => {
            if (control.value === false) {
              return of(null);
            }
            return this.authService.checkEmailExists(control.value).pipe(
              map(res => {
                return res ? {emailExists: true} : null;
              })
            );
          })
        );
      };
    }


  // cancel(): any {
  //   this.cancelRegister.emit(false);
  // }
}
