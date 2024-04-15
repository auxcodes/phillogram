import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable } from 'rxjs';
import { AuthenticationService } from '../authentication.service';
import { UploadService } from '../upload.service';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class UserProfileService {
  constructor(
    private authService: AuthenticationService,
    private afs: AngularFirestore,
    private us: UploadService,
    private router: Router) { }

  getProfile(uid: string): Observable<any> {
    return this.afs.doc(`users/${uid}`).valueChanges();
  }

  async updateProfile(update: any) {
    let uid = undefined;
    await this.authService.authUser().subscribe(user => {
      if (user) {
        uid = user.uid;
      }
    });
    if (uid) {
      const ref = this.afs.collection('users').doc(uid);

      return ref.update({
        photoURL: update.photoURL,
        displayName: update.displayName
      });
    }
    else {
      console.error("User-Profile - Update Profile failed: no uid");
    }
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/home']);
  }
}
