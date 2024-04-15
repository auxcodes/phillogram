import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppRoutingModule } from '../app-routing.module';
import { FormsModule } from '@angular/forms';

import { CardsModule } from '../cards/cards.module';

import { GalleryComponent } from './gallery/gallery.component';
import { LoginComponent } from './login/login.component';
import { UploadComponent } from './upload/upload.component';
import { SubmitComponent } from './submit/submit.component';
import { ChatComponent } from './chat/chat.component';
import { ChatsComponent } from './chats/chats.component';
import { UserProfileComponent } from './user-profile/user-profile.component';
import { AddImagesComponent } from './add-images/add-images.component';
import { UserManagementComponent } from './user-management/user-management.component';

@NgModule({
  declarations: [
    GalleryComponent,
    LoginComponent,
    UploadComponent,
    SubmitComponent,
    ChatComponent,
    ChatsComponent,
    UserProfileComponent,
    AddImagesComponent,
    UserManagementComponent,
  ],
  imports: [
    CommonModule,
    AppRoutingModule,
    FormsModule,
    CardsModule
  ]
})
export class PagesModule { }
