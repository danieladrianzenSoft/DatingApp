import { AuthService } from '../_services/auth.service';

export function appInitializer(authService: AuthService): any {
    return () => new Promise(resolve => {
        // attempt to refresh token on app start up to auto authenticate
        if (authService.loggedIn()){
            authService.refreshToken()
            .subscribe()
            .add(resolve);
        } else{
            resolve(true);
        }

    });
}
