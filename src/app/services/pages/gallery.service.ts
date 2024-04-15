import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { BehaviorSubject } from 'rxjs';

import { Album } from '../../models/album.model';
import { AuthenticationService } from '../authentication.service';
import { ImageService } from '../image.service';

@Injectable({
  providedIn: 'root'
})
export class GalleryService {
  private collection = 'albums';
  albums: BehaviorSubject<Album[]> = new BehaviorSubject<Album[]>([]);

  constructor(
    private authService: AuthenticationService,
    private imageService: ImageService,
    private db: AngularFirestore,
    private storage: AngularFireStorage) { }

  galleryAccessible(galleryId: string) {
    let result = false;
    if (!this.authService.loggingOut) {
      if (this.authService.hasRole([galleryId])) {
        this.getAlbums(galleryId);
        result = true;
      }
      else {
        this.albums.next([]);
        result = false;
      }
    }
    return result;
  }

  private async getAlbums(role: string) {
    this.db.collection<Album>(this.collection, ref => ref.where('role', '==', role))
      .valueChanges().subscribe(
        albums => {
          const items: Album[] = albums.map(album => {
            if (album.$key) {
              this.imageService.getImages(album.$key).subscribe(
                images => {
                  album.images = images.map(image => {
                    this.getImageUrl(image.path || '').then(url => image.url = url);
                    return image;
                  })
                })
            }
            return album;
          })
          this.albums.next(items);
        });
  }

  private async getImageUrl(path: string): Promise<string> {
    let url = '/assets/icons/image_default.svg';
    if (path) {
      const storageRef = this.storage.ref(path);
      const getDLU = storageRef.getDownloadURL().toPromise();
      await getDLU
        .then(dlUrl => {
          if (dlUrl) {
            url = dlUrl;
          }
        })
        .catch(error => {
          if (!environment.production) {
            console.log('GS :: Error getting DLU: ', error)
          }
        });
    }
    return url;
  }
}
