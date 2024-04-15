import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { finalize } from 'rxjs/operators';

import { AuthenticationService } from '../authentication.service';
import { AlbumService } from '../../services/pages/album.service';
import { UploadService } from '../../services/upload.service';
import { Upload } from '../../models/upload.model';
import { Album } from '../../models/album.model';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ContactService {

  private collection = 'messages';
  private selectedAlbum: Album = new Album( '', 0, []);

  //private upload: Upload = new Upload();
  private uploads: string[] = [];
  private tempFiles: string[] = [];

  constructor(
    private authService: AuthenticationService,
    private albumService: AlbumService,
    private us: UploadService,
    private db: AngularFirestore,
    private storage: AngularFireStorage) {
    this.albumService.getSubmitAlbum().subscribe(albums => {
      this.selectAlbum(albums);
    });
  }

  private selectAlbum(albums: Album[]) {
    if (albums.length > 0) {
      this.selectedAlbum = albums[0];
    }
  }

  tempImages(file: File) {
    let tempBehave = this.us.getImagePath(file, 'temp');
    tempBehave.subscribe(url => {
      if (url) {
        this.tempFiles.push(url)
      }
    });
  }

  sendMessage(message: string, files: FileList | undefined) {

    if (files) {
      const filePath = "/images/admin/" + this.selectedAlbum.$key;
  
      for (var i = 0; i < files.length; i++) {
        const fullPath = filePath + "/" + files[i].name;
        const uploadTask = this.storage.upload(fullPath, files[i]);
  
        uploadTask.task.then(snapshot => {
          snapshot.ref.getDownloadURL().then(url => {
            if (url) {
              this.uploads.push(url);
              if (this.uploads.length === files.length) {
                this.uploadMessage(message);
              }
            }
          });
        })
        .catch(error => console.log('Error sending message file: ', error));
      }
    }
    if (message) {
      this.uploadMessage(message);
    }
  }

  private uploadMessage(message: string) {
    let user = this.authService.isGuest() ? 'Guest' : this.authService.getUserAccount().value;

    const messageData = {
      message: message, files: this.uploads, seen: false, sentOn: new Date(), user: user
    };

    this.db.collection(this.collection).add(Object.assign({}, messageData))
      .then(docRef => {
        docRef.update({ $key: docRef.id })
          .catch(error => console.log('Error updating message ref:', error));
      })
      .catch(error => console.error("Error adding message document: ", error))
      .finally(() => { 
        this.uploads = [];
        console.log("Message sent!!");
      });
  }
}
