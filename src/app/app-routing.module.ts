import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { GalleryComponent } from "./pages/gallery/gallery.component";
import { AlbumComponent } from "./album/album.component";
import { ImageDetailComponent } from "./image-detail/image-detail.component";
import { LoginComponent } from './pages/login/login.component';
import { UploadComponent } from './pages/upload/upload.component';
import { AuthenticationGuardService } from './services/authentication-guard.service';
import { SubmitComponent } from './pages/submit/submit.component';
import { ChatComponent } from './pages/chat/chat.component';
import { ChatsComponent } from './pages/chats/chats.component';
import { UserProfileComponent } from './pages/user-profile/user-profile.component';
import { AddImagesComponent } from './pages/add-images/add-images.component';
import { UserManagementComponent } from './pages/user-management/user-management.component';


const routes: Routes = [
  { path: '', redirectTo: '/page/posts/0', pathMatch: 'full' },
  { path: 'home', redirectTo: '/page/posts/0', pathMatch: 'full' },
  { path: 'album/:name/:id', component: AlbumComponent },
  { path: 'auth', component: UserManagementComponent },
  { path: 'image/:album/:id', component: ImageDetailComponent},
  { path: 'upload', component: UploadComponent, canActivate: [AuthenticationGuardService] },
  { path: 'add-image', component: AddImagesComponent, canActivate: [AuthenticationGuardService] },
  { path: 'submit', component: SubmitComponent},
  { path: 'page/:name/:type', component: GalleryComponent, canActivate: [AuthenticationGuardService] },
  { path: 'chats', component: ChatsComponent, canActivate: [AuthenticationGuardService] },
  { path: 'chat/:id', component: ChatComponent, canActivate: [AuthenticationGuardService] },
  { path: 'profile/:id', component: UserProfileComponent, canActivate: [AuthenticationGuardService] },
  { path: 'login', component: LoginComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
