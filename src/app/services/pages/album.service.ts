import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable } from 'rxjs';

import { AuthenticationService } from '../authentication.service';
import { AlbumRoles } from '../../models/albumRoles.model';
import { Album } from '../../models/album.model';

@Injectable({
  providedIn: 'root'
})
export class AlbumService {

  private collection = 'albums';

  constructor(
    private authService: AuthenticationService,
    private db: AngularFirestore) {

  }

  async addAlbum(album: Album): Promise<string | unknown> {
    let albumKey = null;
    await this.db.collection(this.collection).add(Object.assign({}, album))
      .then(docRef => {
        if (docRef) {
          albumKey = docRef.id;
          docRef.update({ $key: docRef.id })
            .then(() => console.log('album $key docRef.id added'))
            .catch(error => console.log('Album Service: Error updating new album ref:', error));

        }
      })
      .catch(error => console.error('Album Service: Error adding album document: ', error));
    return albumKey;
  }

  albumAccessible(albumId: string) {
    return this.getAlbum(albumId)
      .then((doc: any) => {
        if (doc) {
          return (doc.role === 'guest' || this.authService.hasRole([doc.role]));
        }
        else {
          return false;
        }
      })
      .catch((error: any) => console.log('Album Service: Error checking album access:', error));
  }

  getAlbums(role: string): Observable<Album[]> {
    return this.db.collection(this.collection, ref => ref.where('role', '==', role)).valueChanges() as Observable<Album[]> ;
  }

  getAllAlbums(): Observable<Album[]> {
    return this.db.collection(this.collection).valueChanges() as Observable<Album[]> ;
  }

  getGuestAlbums(): Observable<Album[]> {
    return this.db.collection(this.collection, ref => ref.where('role', '==', 'guest')).valueChanges() as Observable<Album[]> ;
  }

  getAlbum(key: string | unknown) {
    return this.db.collection(this.collection).doc(key as string).ref.get()
      .then((doc) => {
        if (doc.exists) {
          return doc.data();
        }
        else {
          return new Album('undefined', AlbumRoles.guest, []);
        }
      })
      .catch((error) => console.log('Album Service: Error getting album:', error));
  }

  getSubmitAlbum(): Observable<Album[]> {
    return this.db.collection(this.collection, ref => ref.where('name', '==', 'Submissions')).valueChanges() as Observable<Album[]> ;
  }

  updateAlbumImageCount(albumKey: string, imageCount: number) {
    let newCount: number = imageCount;
    this.getAlbum(albumKey)
      .then((data: any) => {
        if (data) {
          newCount += data.size;
        }
      })
      .catch(error => console.log(' Album Service: Error getting album data for update:', error))
      .finally(() => {
        this.db.collection(this.collection).doc(albumKey).update({ size: newCount })
          .catch(error => console.log("Error updating album image count data:", error))
      });
  }

  updateAlbumImageList(albumKey: string, images: string[]) {
      this.db.collection(this.collection).doc(albumKey).update({ images: images })
        .catch(error => console.log("Error updating album image list:", error))
  }

  deleteAlbum(albumId: string) {
    console.log('album: ', albumId);
    return this.getAlbum(albumId)
      .then(album => {
        if (album) {
          this.db.collection('albums').doc(albumId).delete()
            .then(() => console.log('Album deleted successfully'))
            .catch(error => console.log('Album Service: Error deleting image:', error));
          //.finally(() => this.deleteAlbumCollection(albumId));
        }
      })
      .catch(error => console.log('Album Service: Error getting image for deletion:', error));
  }

  //private deleteAlbumCollection(albumId: string) {
  //  this.db.collection(albumId). delete()
  //    .then(() => console.log("Image deleted successfully"))
  //    .catch(error => console.log("Error deleting image:", error))
  //    .finally(() => this.deleteAlbumCollection(albumId));
  //}
}
