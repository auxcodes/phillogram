import { Component, OnInit } from '@angular/core';
import { ImageService } from '../../services/image.service';
import { AuthenticationService } from '../../services/authentication.service';
import { ContextMenuService } from '../../services/context-menu.service';
import { Router } from '@angular/router';
import { AlbumService } from '../../services/pages/album.service';

@Component({
  selector: 'app-image-menu',
  templateUrl: './image-menu.component.html',
  styleUrls: ['./image-menu.component.scss']
})
export class ImageMenuComponent implements OnInit {

  private imageId: string | unknown = '';
  private albumId: string  | unknown = '';
  private albumName: string = '';

  constructor(
    private menuService: ContextMenuService,
    private imageService: ImageService,
    private albumService: AlbumService,
    private authService: AuthenticationService,
    private router: Router) { }

  ngOnInit() {
    let inFocus = this.menuService.objectInFocus();
    if (inFocus){ 
    this.albumId = inFocus.albumId;
    this.imageId = inFocus.imageId;
    this.albumService.getAlbum(inFocus.albumId)
      .then((album: any) => {
        if (album) {
          this.albumName = album.name;
        }
      })
      .catch(error => console.log("Error getting album for Image Context Menu: " + error));
    }
  }

  hasAccess(): boolean {
    return this.authService.canUpload();
  }

  deleteImage() {
    if (this.hasAccess()) {
      this.imageService.deleteImage(this.imageId as string, this.albumId as string);
      this.router.navigate(['album/' + this.albumName + '/' + this.albumId]);
    }
    else {
      this.router.navigate(['login']);
    }
  }



}
