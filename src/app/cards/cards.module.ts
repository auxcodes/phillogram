import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppRoutingModule } from '../app-routing.module';

import { ImageCardComponent } from './image-card/image-card.component';
import { AlbumCardComponent } from './album-card/album-card.component';

@NgModule({
  declarations: [
    ImageCardComponent,
    AlbumCardComponent
  ],
  imports: [
    CommonModule,
    AppRoutingModule
  ],
  exports: [
    ImageCardComponent,
    AlbumCardComponent
  ],
})
export class CardsModule { }
