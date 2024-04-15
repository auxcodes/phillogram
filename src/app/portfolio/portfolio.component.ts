import { Component, OnInit, OnChanges } from '@angular/core';
import { AlbumService } from '../services/pages/album.service';
import { Observable } from 'rxjs';
import { Album } from '../models/album.model';
import { ImageService } from '../services/image.service';

@Component({
  selector: 'app-portfolio',
  templateUrl: './portfolio.component.html',
  styleUrls: ['./portfolio.component.scss']
})
export class PortfolioComponent implements OnInit, OnChanges {

  title = "Portfolio Albums"
  albums!: Observable<Album[]>;
  newAlbums: Album[] = [];

  constructor(private albumService: AlbumService,
    private imageService: ImageService) {
  }

  ngOnInit() {
    this.getAlbums();
  }

  ngOnChanges() {
    this.getAlbums();
  }

  private getAlbums() {
    this.albumService.getGuestAlbums().subscribe(
      albums => {
        this.newAlbums = albums.map(album => {
          if (album.$key) {
            this.imageService.getImages(album.$key).subscribe(
              images => album.images = images
            )  
          }
          else {
            console.log('Portfolio- Album key missing: ', album);
          }
          return album;
        })
      }
    );
  }


}
