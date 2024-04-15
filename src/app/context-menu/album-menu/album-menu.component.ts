import { Component, OnInit } from '@angular/core';
import { ImageService } from '../../services/image.service';
import { AuthenticationService } from '../../services/authentication.service';
import { ContextMenuService } from '../../services/context-menu.service';
import { Router } from '@angular/router';
import { AlbumService } from '../../services/pages/album.service';

@Component({
  selector: 'app-album-menu',
  templateUrl: './album-menu.component.html',
  styleUrls: ['./album-menu.component.scss']
})
export class AlbumMenuComponent implements OnInit {
  private albumId: string | unknown = '';
  private albumName: string | unknown = '';

  constructor(
    private menuService: ContextMenuService,
    private imageService: ImageService,
    private albumService: AlbumService,
    private authService: AuthenticationService,
    private router: Router) { }

  ngOnInit() {
    let inFocus = this.menuService.objectInFocus();
    if (inFocus) {
      this.albumId = inFocus.albumId;
    }
  }

  hasAccess(): boolean {
    return this.authService.canUpload();
  }

  deleteAlbum() {
    if (this.hasAccess()) {
      this.albumService.deleteAlbum(this.albumId as string);
    }
  }

}
