import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Router, ActivatedRoute } from '@angular/router';

import { NavLink } from '../models/navLink.model';
import { AuthenticationService } from './authentication.service';

@Injectable({
  providedIn: 'root'
})
export class NavigationService {

  navLinks: BehaviorSubject<NavLink[]> = new BehaviorSubject<NavLink[]>([]);
  rightNavLinks: BehaviorSubject<NavLink[]> = new BehaviorSubject<NavLink[]>([]);
  private homeLink = { name: 'feed', slug: '/home', text: 'FEED', icon: 'assets/icons/grid_on-24px.svg' };

  constructor(private authService: AuthenticationService,
    private router: Router,
    private route: ActivatedRoute) {
    this.navLinks.next([this.homeLink]);
    authService.rolesReady.subscribe(ready => {
      if (ready) {
        this.navLinks.next(this.navbarLinks());
        this.rightNavLinks.next(this.rightNavMenu());
      }
    });
  }

  private navbarLinks(): NavLink[] {
    const links: NavLink[] = [
      this.homeLink,
      { name: 'posts', slug: '/page/shots/1', text: 'POSTS', icon: 'assets/icons/photo_library-24px.svg' },
      { name: 'stories', slug: '/page/snaps/2', text: 'STORIES', icon: 'assets/icons/photo_album-24px.svg' }
    ];
    //if (this.authService.canView()) {
    //  links.push({ name: 'posts', slug: '/page/shots/1', text: 'POSTS', icon: 'assets/icons/photo_library-24px.svg' });
    //}
    //if (this.authService.canSubmit()) {
    //  links.push({ name: 'stories', slug: '/page/snaps/2', text: 'STORIES', icon: 'assets/icons/photo_album-24px.svg' });
    //}
    return links;
  }

  private rightNavMenu() {
    const links: NavLink[] = [];
    //if (this.authService.canSubmit()) {
    //  links.push({ name: 'submit', slug: '/submit', text: 'SAY HI!', icon: 'assets/icons/emoji_people-24px.svg' });
    //}
    //if (this.authService.canUpload()) {
    //  links.push({ name: 'upload', slug: '/upload', text: 'UPLOAD', icon: 'assets/icons/add_image.svg'  });
    //}
    return links;
  }

  upload() {
    this.router.navigate(['add-image'], { relativeTo: this.route });
  }

  resetLinks() {
    console.log('reset links');
    this.navLinks.next([this.homeLink]);
  }
}
