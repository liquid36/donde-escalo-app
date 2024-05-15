import { Injectable } from "@angular/core";
import { BehaviorSubject, Subject, map, tap } from "rxjs";
import * as Realm from "realm-web";

@Injectable({ providedIn: 'root'})
export class AuthService {
    app: Realm.App;
    private _user = new Subject<Realm.User | null>();

    public user$ = this._user.asObservable();
    public isAnonimous$ = this.user$.pipe(
        map(user => !user || this.isAnonimous(user))
    );

    constructor() {
        this.app = new Realm.App({ id: "climbing-app-ongai" });
        (window as any).app = this.app;

        setTimeout(() => {
            this._user.next(this.getUser());
        }, 1);
    }

    initialize() {
        if (!this.getUser()) {
            this.loginAnonymous();
        }
    }

    getUser() {
        return this.app.currentUser;
    }

    async loginAnonymous() {
        const credentials = Realm.Credentials.anonymous();
        const user = await this.app.logIn(credentials); 
        console.assert(user.id === this.app.currentUser?.id);
        this._user.next(user);  
        return user;
    }

    async loginWithGoogle(response: any) {
        const credentials = Realm.Credentials.google({ idToken: response.credential });
        const user = await this.app.logIn(credentials);
        this._user.next(user);
        return user;
    }

    isAnonimous(user: Realm.User) {
        return user.providerType === 'anon-user';
    }

    async logout() {
        await this.app.currentUser?.logOut();
        await this.loginAnonymous();
        return true;
    }
}