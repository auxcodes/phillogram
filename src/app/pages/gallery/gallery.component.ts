import { Component, OnInit, OnChanges, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { Observable } from 'rxjs';

import { AlbumRoles } from '../../models/albumRoles.model';
import { Album } from '../../models/album.model';
import { GalleryService } from '../../services/pages/gallery.service';

@Component({
  selector: 'app-gallery',
  templateUrl: './gallery.component.html',
  styleUrls: ['./gallery.component.scss']
})
export class GalleryComponent implements OnInit, OnChanges, OnDestroy {
  title = 'Photo Albums';
  albums!: Observable<Album[]>;
  newAlbums: Album[] = [];
  navigationSubscription;

  constructor(
    private galleryService: GalleryService,
    private router: Router,
    private route: ActivatedRoute) {
    this.navigationSubscription = router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.galleryAccessible();
      }
    });
  }

  ngOnInit() {
  }

  ngOnChanges() {  }

  ngOnDestroy() {
    this.navigationSubscription.unsubscribe();
  }

  private galleryAccessible() {
    if (this.galleryService.galleryAccessible(AlbumRoles[this.route.snapshot.params['type']])) {
      this.title = this.route.snapshot.params['name'];
      this.galleryService.albums.subscribe(albums => this.newAlbums = albums);
    }
    else {
      this.router.navigate(['login']);
    }
  }

}
