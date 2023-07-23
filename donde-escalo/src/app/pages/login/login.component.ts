import { Component, inject } from "@angular/core";
import { Router } from "@angular/router";
import { AuthService } from "src/app/services/auth.service";
import { loginWithGoogle } from "src/app/services/realm";

@Component({
    selector: 'app-login',
    templateUrl: 'login.component.html'
})
export class LoginComponent {
    authService = inject(AuthService);
    router = inject(Router);

    login() {
        (window as any).google.accounts.id.initialize({
            client_id: '47050531150-7u97nbu6averr9ce1c1trj0ftikrhlk0.apps.googleusercontent.com',
            callback: this.handleCredentialResponse
          });
          (window as any).google.accounts.id.prompt();
    }

    handleCredentialResponse = (response: any) => {
        this.authService.loginWithGoogle(response).then(() => {
            this.router.navigate(['/home']);
        });
    }
}