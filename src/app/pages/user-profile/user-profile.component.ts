import { Component, OnInit } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { AuthenticationService } from '../../services/authentication.service';
import { UserProfileService } from '../../services/pages/user-profile.service';
import { UploadService } from '../../services/upload.service';


@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.scss']
})
export class UserProfileComponent implements OnInit {

  email: string = 'loading...';
  displayName: string = 'loading...';
  photoURL: string = 'assets/icons/account_circle-24px.svg';

  private image!: File;
  private imagePreviewSrc: any;
  private imageUrl: string = '';
  private imageLoaded: BehaviorSubject<string> = new BehaviorSubject<string>('');

  constructor(
    private auth: AuthenticationService,
    private upService: UserProfileService,
    private us: UploadService) { }

  ngOnInit() {
    this.auth.rolesReady.subscribe(ready => {
      if (ready) {
        this.auth.authUser().subscribe(user => {
          if (user) {
            this.upService.getProfile(user.uid).subscribe(user => {
              this.displayName = user.displayName;
              this.photoURL = user.photoURL;
              this.email = user.email;
            });
          }
        });
      }
    });
  }

  selectImage(event: any) {
    this.image = event.target.files[0];
    this.imageLoaded = this.us.getImagePath(this.image, 'profiles');
    this.photoURL = '';
    this.imageLoaded.subscribe(url => {
      this.photoURL = url;
    });
  }

  onUpdateProfile() {
    const profileData = { photoURL: this.photoURL, displayName: this.displayName };
    this.upService.updateProfile(profileData)
      .catch(error => console.log('Error updating profile:', error));
  }

  onLogout() {
    this.upService.logout();
  }
}
