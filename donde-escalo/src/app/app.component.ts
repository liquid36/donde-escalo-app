import { Component, OnInit, inject } from '@angular/core';
import { initFlowbite } from 'flowbite';
import { getPlaces, getUser, getWether, loginAnonymous } from './services/realm';
import * as suncalc from 'suncalc';
import { AuthService } from './services/auth.service';
import { Router } from '@angular/router';
import { tap } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'donde-escalo';

  places: any[] = [];
  wether: any[] = [];

  authService = inject(AuthService);
  router = inject(Router);
  isAnonimous$ = this.authService.isAnonimous$;

  showMenu = false;

  async ngOnInit() {
    initFlowbite();
    this.authService.initialize();
     
    this.router.events.pipe(
      tap(() => this.showMenu = false)
    ).subscribe();

  }
}
