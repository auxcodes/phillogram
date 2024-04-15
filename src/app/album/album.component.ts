import { Component, OnInit, OnChanges, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router'
import { Observable } from 'rxjs';

import { ImageService } from '../services/image.service';
import { AlbumService } from '../services/pages/album.service';
import { GalleryImage } from '../models/galleryImage.model';

@Component({
  selector: 'app-album',
  templateUrl: './album.component.html',
  styleUrls: ['./album.component.scss']
})
export class AlbumComponent implements OnInit, OnChanges, OnDestroy {
  title = 'Photos';
  key: string = '';
  images!: Observable<GalleryImage[]>;
  private navigationSubscription;

  constructor(
    private imageService: ImageService,
    private albumService: AlbumService,
    private router: Router,
    private route: ActivatedRoute) {
    this.navigationSubscription = router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.albumAccessible();
      }
    });
  }

  ngOnInit() { }

  ngOnChanges() { }

  ngOnDestroy() {
    this.navigationSubscription.unsubscribe();
  }

  private albumAccessible() {
    this.albumService.albumAccessible(this.route.snapshot.params['id'])
      .then((canOpen) => {
        if (canOpen) {
          this.title = this.route.snapshot.params['name'] + ' Photos';
          this.key = this.route.snapshot.params['id'];
          this.getAlbumImages(this.route.snapshot.params['id']);
        }
        else {
          this.router.navigate(['/login']);
        }
      })
      .catch(error => console.log("Error getting album accessibility: ", error));
  }

  private getAlbumImages(key: string) {
    this.images = this.imageService.getImages(key);
    this.images.subscribe();
  }
}
