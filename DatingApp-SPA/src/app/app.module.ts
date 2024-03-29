import { BrowserModule, HammerModule, HammerGestureConfig} from '@angular/platform-browser';
import { NgModule, APP_INITIALIZER } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FileUploadModule } from 'ng2-file-upload/';
import { JwtModule } from '@auth0/angular-jwt';
import { NgxGalleryModule } from 'ngx-gallery-9';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { ButtonsModule } from 'ngx-bootstrap/buttons';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { CollapseModule } from 'ngx-bootstrap/collapse';
import { ModalModule } from 'ngx-bootstrap/modal';
import { AutosizeModule } from 'ngx-autosize';
import { NgxSpinnerModule } from 'ngx-spinner';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';

import { AppComponent } from './app.component';
import { NavComponent } from './nav/nav.component';
import { AuthService } from './_services/auth.service';
import { HomeComponent } from './home/home.component';
import { RegisterComponent } from './register/register.component';
import { ErrorInterceptorProvider, ErrorInterceptor } from './_services/error.interceptor';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MemberListComponent } from './members/member-list/member-list.component';
import { ListsComponent } from './lists/lists.component';
import { MessagesComponent } from './messages/messages.component';
import { appRoutes } from './routes';
import { MemberCardComponent } from './members/member-card/member-card.component';
import { MemberDetailComponent } from './members/member-detail/member-detail.component';
import { MemberDetailResolver } from './_resolvers/member-detail.resolver';
import { MemberListResolver } from './_resolvers/member-list.resolver';
import { MemberEditComponent } from './members/member-edit/member-edit.component';
import { MemberEditResolver } from './_resolvers/member-edit.resolver';
import { AlertifyService } from './_services/alertify.service';
import { AuthGuard } from './_guards/auth.guard';
import { PreventUnsavedChangesGuard } from './_guards/prevent-unsaved-changes.guard';
import { UserService } from './_services/user.service';
import { PhotoEditorComponent } from './members/photo-editor/photo-editor.component';
import { TimeagoModule } from 'ngx-timeago';
import { ListsResolver } from './_resolvers/lists.resolver';
import { MessagesResolver } from './_resolvers/messages.resolver';
import { MemberMessagesComponent } from './members/member-messages/member-messages.component';
import { AdminPanelComponent } from './admin/admin-panel/admin-panel.component';
import { HasRoleDirective } from './_directives/hasRole.directive';
import { UserManagementComponent } from './admin/user-management/user-management.component';
import { PhotoManagementComponent } from './admin/photo-management/photo-management.component';
import { AdminService } from './_services/admin.service';
import { RolesModalComponent } from './admin/roles-modal/roles-modal.component';
import { LoginComponent } from './login/login.component';
import { ConfirmEmailComponent } from './verify-account/confirm-email/confirm-email';
import { ConfirmEmailResolver } from './_resolvers/confirm-email.resolver';
import { AwaitingEmailVerificationComponent } from './verify-account/awaiting-email-verification/awaiting-email-verification.component';
import { TextInputComponent } from './shared/text-input/text-input.component';
import { ChatService } from './_services/chat.service';
import { LoadingInterceptor } from './_services/loading.interceptor';
import { ForgotPasswordComponent } from './password-reset/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './password-reset/reset-password/reset-password.component';
import { appInitializer } from './_resolvers/app.Initializer';

export function tokenGetter(): any {
   return localStorage.getItem('token');
}

export class MyHammerConfig extends HammerGestureConfig  {
   overrides = {
     swipe: {velocity: 0.4, threshold: 20} // override default settings
   };
}

@NgModule({
   declarations: [
      AppComponent,
      NavComponent,
      HomeComponent,
      RegisterComponent,
      MemberListComponent,
      ListsComponent,
      MessagesComponent,
      MemberCardComponent,
      MemberDetailComponent,
      MemberEditComponent,
      PhotoEditorComponent,
      MemberMessagesComponent,
      AdminPanelComponent,
      HasRoleDirective,
      UserManagementComponent,
      PhotoManagementComponent,
      RolesModalComponent,
      LoginComponent,
      ConfirmEmailComponent,
      AwaitingEmailVerificationComponent,
      TextInputComponent,
      ForgotPasswordComponent,
      ResetPasswordComponent,
   ],
   imports: [
      BrowserModule,
      BrowserAnimationsModule,
      HttpClientModule,
      FormsModule,
      ReactiveFormsModule,
      PaginationModule.forRoot(),
      BsDropdownModule.forRoot(),
      BsDatepickerModule.forRoot(),
      TabsModule.forRoot(),
      ButtonsModule.forRoot(),
      RouterModule.forRoot(appRoutes),
      TimeagoModule.forRoot(),
      ModalModule.forRoot(),
      CollapseModule.forRoot(),
      NgxGalleryModule,
      FileUploadModule,
      HammerModule,
      AutosizeModule,
      NgxSpinnerModule,
      InfiniteScrollModule,
      JwtModule.forRoot({
         config: {
            tokenGetter,
            allowedDomains: ['localhost:5001'],
            disallowedRoutes: ['localhost:5001/api/auth']
         }
      })
   ],
   providers: [
      AuthService,
      AlertifyService,
      AuthGuard,
      UserService,
      AdminService,
      ChatService,
      MemberDetailResolver,
      MemberListResolver,
      MemberEditResolver,
      ConfirmEmailResolver,
      ErrorInterceptorProvider,
      LoadingInterceptor,
      {provide: HTTP_INTERCEPTORS, useClass: LoadingInterceptor, multi: true},
      {provide: APP_INITIALIZER, useFactory: appInitializer, multi: true, deps: [AuthService]},
      PreventUnsavedChangesGuard,
      ListsResolver,
      MessagesResolver,
      // {
      //    provide: HAMMER_GESTURE_CONFIG,
      //    useClass: MyHammerConfig
      //  }
   ],
   entryComponents: [
      RolesModalComponent
   ],
   bootstrap: [
      AppComponent
   ]
})

export class AppModule { }
