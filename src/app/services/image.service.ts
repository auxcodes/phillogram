import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import firebase from 'firebase/compat/app';
import { GalleryImage } from '../models/galleryImage.model';
import { AuthenticationService } from './authentication.service';


@Injectable({
  providedIn: 'root'
})
export class ImageService {
  private user!: firebase.User | null;
  private currentAlbum: string = '';
  private currentImage: string = '';

  constructor(
    private authService: AuthenticationService,
    private db: AngularFirestore,
    private storage: AngularFireStorage) {
    this.authService.authUser().subscribe(user => this.user = user ? user : null);
  }

  getImages(albumKey: string): Observable<GalleryImage[]> {
    this.currentAlbum = albumKey;
    return this.db.collection<GalleryImage>(albumKey).valueChanges();
  }

  getImage(imageKey: string, albumKey: string): Promise<void | GalleryImage | undefined>{
    this.currentAlbum = albumKey;
    this.currentImage = imageKey;
    return this.db.collection(albumKey).doc(imageKey).ref.get()
      .then(function (doc) {
        if (doc.exists) {
          return doc.data() as GalleryImage;
        }
        else {     
          return undefined;
        }
      })
      .catch(function (error) {
        console.log("Error getting image:", error);
      });
  }

  deleteImage(imageKey: string, albumKey: string) {
    this.currentAlbum = albumKey;
    return this.getImage(imageKey, albumKey)
      .then((image) => {
        if (image) {
          const url = image.url;
          this.db.collection(albumKey).doc(imageKey).delete()
            .then(() => console.log("Image deleted successfully"))
            .catch(error => console.log("Error deleting image:", error))
            .finally(() => this.deleteFile(url));
        }
      })
      .catch(error => console.log("Error getting image for deletion:", error));
  }

  private deleteFile(url: string | undefined) {
    if (!url) return;
    const storageRef = this.storage.storage.refFromURL(url);
    storageRef.delete();
  }
}
