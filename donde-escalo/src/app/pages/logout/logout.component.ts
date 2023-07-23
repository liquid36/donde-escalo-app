import { Component, OnInit, inject } from "@angular/core";
import { Router } from "@angular/router";
import { AuthService } from "src/app/services/auth.service";

@Component({
    selector: 'app-logout',
    template: ''
})
export class LogoutComponent implements OnInit {
    router = inject(Router);
    auth = inject(AuthService);

    ngOnInit(): void {
        this.auth.logout().then(() => {
            this.router.navigate(['/home']);
        });
    }
}