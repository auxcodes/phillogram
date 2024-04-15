import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { map } from 'rxjs/operators';
import { take } from 'rxjs/operators';

import { AuthenticationService } from './authentication.service';
import { GalleryService } from './pages/gallery.service';
import { AlbumRoles } from '../models/albumRoles.model';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationGuardService implements CanActivate {
  user!: User;

  constructor(private auth: AuthenticationService,
    private router: Router,
    private galleryService: GalleryService) {
    this.auth.getUserAccount().subscribe(user => this.user = user);
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    let result = false;

    switch (route.url[0].path) {
      case 'chat': {
        result = this.auth.canView();
        break;
      }
      case 'chats': {
        result = this.auth.canView();
        break;
      }
      case 'profile': {
        result = this.auth.canView();
        break;
      }
      case 'page': {
        result = this.galleryService.galleryAccessible(AlbumRoles[route.params['type']])
        break;
      }
      case 'upload': {
        result = this.auth.canUpload();
        break;
      }
      case 'add-image': {
        result = this.auth.canUpload();
        break;
      }
      default: {
        this.auth.authUser().pipe(
          map((auth) => {
            if (!auth) {
              result = false;
            }
            result = true;
          }),
          take(1)
        );
        break;
      }
    }
    // route to login if fails checks
    if (result === false) {
      this.router.navigateByUrl('/login');
    }
    return result;
  }
}
