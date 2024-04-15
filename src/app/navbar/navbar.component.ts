import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Observable, BehaviorSubject } from 'rxjs';
import firebase from 'firebase/compat/app';
import { AuthenticationService } from '../services/authentication.service';
import { NavigationService } from '../services/navigation.service';
import { ChatService } from '../services/chat/chat.service';
import { NavLink } from '../models/navLink.model';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {
  title = "Gallery";
  user: Observable<firebase.User | null>;
  loggedIn = false;
  routerlinks: NavLink[] = [];
  rightNavLinks: NavLink[] = [];
  userChats$: Observable<any> = new Observable<any>;
  unreadMsg = false;
  activeItem = '';
  private uid = '';

  constructor(
    public navService: NavigationService,
    private authService: AuthenticationService,
    private cs: ChatService,
    private router: Router,
    private route: ActivatedRoute) {
    this.user = this.authService.authUser();
    this.authService.logginIn.subscribe(done => this.loggedIn = done);
  }

  ngOnInit() {
    this.user.subscribe(user => {
      if (user) {
        this.uid = user.uid;
      }
    });
    this.navService.navLinks.subscribe(data => this.routerlinks = data);
    this.navService.rightNavLinks.subscribe(data => this.rightNavLinks = data);
    if (this.uid) {
      this.cs.getChatUpdates();
      this.cs.unreadMessages.subscribe(status => this.unreadMsg = status);

      //this.userChats$ = this.authService.canUpload() ? this.cs.getAdminChats() : this.cs.getUserChats();
      //this.userChats$.subscribe(chats => {
      //  if (chats) {
      //    for (const chat of chats) {
      //      if (chat.unreadMsg > 0) {
      //        this.unreadMsg = true;
      //      }
      //    }
      //  }
      //});
    }
  }

  isGeneral(): boolean {
    return this.uid ? this.authService.canView() : false;
  }

  isSubscriber(): boolean {
    return this.uid ? this.authService.canSubmit() : false;
  }

  isAdmin() {
    return this.uid ? this.authService.canUpload() : false;
  }

  onClickMessage() {
    this.router.navigate(['/chats'], { relativeTo: this.route });
  }

  onClickProfile() {
    this.router.navigate(['/profile/', this.uid], { relativeTo: this.route });
  }

  onClickLink(menuItem: string) {
    this.activeItem = menuItem;
  }

  logOut() {
    this.router.navigate(['/home'], { relativeTo: this.route });
    this.routerlinks = [];
    this.navService.resetLinks();
    this.authService.logout()
      .then(() => {
        this.navService.navLinks.subscribe(data => this.routerlinks = data);
      })
      .catch(error => console.log('logout: ', error));
  }
}
