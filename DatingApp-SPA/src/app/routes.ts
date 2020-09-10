import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { MemberListComponent } from './members/member-list/member-list.component';
import { MessagesComponent } from './messages/messages.component';
import { ListsComponent } from './lists/lists.component';
import { AuthGuard } from './_guards/auth.guard';
import { MemberDetailComponent } from './members/member-detail/member-detail.component';
import { MemberDetailResolver } from './_resolvers/member-detail.resolver';
import { MemberListResolver } from './_resolvers/member-list.resolver';
import { MemberEditComponent } from './members/member-edit/member-edit.component';
import { MemberEditResolver } from './_resolvers/member-edit.resolver';
import { PreventUnsavedChangesGuard } from './_guards/prevent-unsaved-changes.guard';
import { ListsResolver } from './_resolvers/lists.resolver';
import { MessagesResolver } from './_resolvers/messages.resolver';
import { AdminPanelComponent } from './admin/admin-panel/admin-panel.component';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { ConfirmEmailComponent } from './verify-account/confirm-email/confirm-email';
import { ConfirmEmailResolver } from './_resolvers/confirm-email.resolver';
import { ResetPasswordComponent } from './password-reset/reset-password/reset-password.component';
// import { AwaitingEmailVerificationComponent } from './verify-account/awaiting-email-verification/awaiting-email-verification.component';

export const appRoutes: Routes = [
    {path: '', component: HomeComponent},
    {   // making a dummy route that is protected by authguard, with all
        // children routes also being protected.
        path: '',
        runGuardsAndResolvers: 'always',
        canActivate: [AuthGuard],
        children: [
            {path: 'members', component: MemberListComponent, resolve: {users: MemberListResolver}},
            {path: 'members/:id', component: MemberDetailComponent, resolve: {user: MemberDetailResolver}},
            {path: 'member/edit', component: MemberEditComponent, resolve: {user: MemberEditResolver},
                canDeactivate: [PreventUnsavedChangesGuard]},
            {path: 'messages', component: MessagesComponent, resolve: {messages: MessagesResolver}},
            {path: 'lists', component: ListsComponent, resolve: {users: ListsResolver}},
            {path: 'admin', component: AdminPanelComponent, data: {roles: ['Admin', 'Moderator']}},
        ]
    },
    {path: 'login', component: LoginComponent, data: {navbar: false}},
    {path: 'register', component: RegisterComponent, data: {navbar: false}},
    {path: 'confirm-email', pathMatch: 'full', component: ConfirmEmailComponent, resolve: {isVerified: ConfirmEmailResolver}},
    {path: 'reset-password', pathMatch: 'full', component: ResetPasswordComponent},
    // {path: 'awaiting-email-verification', component: AwaitingEmailVerificationComponent},
    {path: '**', redirectTo: '', pathMatch: 'full'}
];
