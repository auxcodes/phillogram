import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import firebase from 'firebase/compat/app';
import { Observable, BehaviorSubject } from 'rxjs';

import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {

  rolesReady: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  loggingOut = false;
  logginIn: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  private fbUser: Observable<firebase.User | null>;
  private user!: BehaviorSubject<User>;
  private currentUser!: firebase.User | null;
  private userCollection = 'users';
  private userRoles: Array<string> = [];

  constructor(
    private afAuth: AngularFireAuth,
    private afs: AngularFirestore,
    private http: HttpClient) {
    this.fbUser = this.afAuth.authState;
    this.fbUser.subscribe(user => {
      this.currentUser = user;
      this.getUser(user)
    });
  }

  async login(email: string, password: string) {
    return await this.afAuth.signInWithEmailAndPassword(email, password)
      .then(credential => {
        //console.log('credential user: ', credential.user.uid);
        return this.updateUser(credential.user);
      })
      .catch((error: any) => console.log('Auth Service: Error logging in with email and password:', error));
  }

  async googleLogin() {
    const provider = new firebase.auth.GoogleAuthProvider();
    return await this.afAuth.signInWithPopup(provider)
      .then((credential: { user: any; }) => {
        this.updateUser(credential.user);
      })
      .catch((error: any) => console.log('Auth Service: Error logging in with Google:', error));
  }

  private customToken(uid: string) {
    this.http.post<any>('https://phillogram.aux.codes/.netlify/functions/custom_token', { 'auth': { 'uid': uid } })
      .subscribe(result => {
        //console.log('af function result: ', result);
        if (result) {
          this.afAuth.signInWithCustomToken(result)
            .then((response: any) => {
              //console.log('login response: ', response);
              this.logginIn.next(true);
            })
            .catch((error: any) => {
              //console.log('custom token errors: ', error)
              this.logginIn.next(true);
            });
        }
      },
        error => console.log('af function error: ', error)
      );
  }

  async logout() {
    this.loggingOut = true;
    await this.afAuth.signOut()
      .then(() => this.setUserAsGuest())
      .catch(error => console.log('Signout error: ', error))
      .finally(() => this.loggingOut = false);
  }

  authUser(): Observable<firebase.User | null> {
    return this.fbUser;
  }

  getUserAccount() {
    if (!this.user) {
      this.setUserAsGuest();
    }
    return this.user;
  }

  isGuest(): boolean {
    const allowed = ['guest'];
    return this.matchingRole(allowed);
  }

  canView(): boolean {
    const allowed = ['viewer', 'subscriber', 'admin'];
    return this.matchingRole(allowed);
  }

  canSubmit(): boolean {
    const allowed = ['subscriber', 'admin'];
    return this.matchingRole(allowed);
  }

  canUpload(): boolean {
    const allowed = ['admin'];
    return this.matchingRole(allowed);
  }

  hasRole(role: string[]): boolean {
    return this.matchingRole(role);
  }

  private getUser(user: firebase.User | User | null) {
    if (user) {
      this.afs.collection(this.userCollection).doc(user.uid).ref.get()
        .then((doc) => {
          if (doc.exists) {
            this.user = new BehaviorSubject<User>(doc.data() as User);
          }
          else {
            this.setUserAsGuest();
          }
        })
        .catch(error => console.log("Error getting user:", error))
        .finally(() => {
          this.userRoles = this.user.value.roles || [];
          this.rolesReady.next(true);
          if (this.currentUser) {
            this.customToken(this.currentUser.uid);
          }
        });
    }
    else {
      this.getUser({ uid: 'p8PPj4flEr4bkVNuTipM' });
    }
  }

  private setUserAsGuest() {
    this.userRoles = ['guest'];
    this.user = new BehaviorSubject<User>({ email: 'anon@aux.codes', photoURL: 'undefined' });
  }

  private async updateUser(authData: firebase.User | null) {
    if (!authData) {
      return;
    } 
    const userData = new User(authData);
    const ref = this.getUserCollection();
    if (ref) {
      await this.afs.collection(this.userCollection).doc(authData.uid).ref.get()
        .then(doc => {
          const userData = doc.data() as User;
          if (userData && !userData.roles) {
            doc.ref.update(Object.assign({}, userData));
          }
          else if (!userData) {
            this.addUser(Object.assign({}, userData));
          }
          else {
            this.getUser(Object.assign({}, userData));
          }
        })
        .catch(error => console.log("Error updating user:", error));
    }
    else {
      this.addUser(userData);
    }
  }

  private addUser(userData: User) {
    this.afs.collection(this.userCollection).doc(userData.uid).set(Object.assign({}, userData))
      .catch((error) => console.log("Error setting image view data:", error))
      .finally(() => this.getUser(userData));
  }

  private getUserCollection() {
    return this.afs.collection(this.userCollection).ref;
  }

  private matchingRole(allowedRoles: string[]): boolean {
    //console.log("user: ", this.user.value, ", user roles: " + this.userRoles + ", allowed roles: " + allowedRoles)
    return this.userRoles ? allowedRoles.filter(role => this.userRoles.includes(role)).length > 0 : false;
  }

}
