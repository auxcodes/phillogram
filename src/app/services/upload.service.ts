import { Injectable } from '@angular/core';
import { AngularFireModule } from '@angular/fire/compat';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import firebase from 'firebase/compat/app';
import { Upload } from '../models/upload.model';
import { Observable, BehaviorSubject } from 'rxjs';
import { ImageDataService } from './image-data.service';
import { AuthenticationService } from './authentication.service';
import { ImageViewData } from '../models/imageViewData.model';

@Injectable({
  providedIn: 'root'
})
export class UploadService {
  private user: Observable<firebase.User | null>;
  private userEmail: string = '';
  private uid: string = '';

  uploadPercent!: Observable<number | undefined>;

  constructor(
    private ngFire: AngularFireModule,
    private storage: AngularFireStorage,
    private db: AngularFirestore,
    private dataService: ImageDataService,
    private authService: AuthenticationService) {

    this.user = this.authService.authUser();
    this.user.subscribe((user) => {
      if (user) {
        this.userEmail = user.email ? user.email : '';
        this.uid = user.uid;
      }
    });
  }

  getImagePath(file: File, type: string): BehaviorSubject<string> {
    const filePath = "/images/" + type + "/" + this.uid + "/" + file.name;
    const uploadTask = this.storage.upload(filePath, file);
    const urlBehaviour: BehaviorSubject<string> = new BehaviorSubject<string>('');
    // check when upload is done
    uploadTask.task.then(snapshot => {
      snapshot.ref.getDownloadURL().then(url => {
        urlBehaviour.next(url);
      });
    });
    return urlBehaviour;
  }

  addImage(image: Upload): BehaviorSubject<string> {
    const imageRef: BehaviorSubject<string> = new BehaviorSubject<string>('');
    this.db.collection(image.collection).add(Object.assign({}, image))
      .then(docRef => {
        docRef.update({ $key: docRef.id, progress: 100 });
        imageRef.next(docRef.id);
        this.addImageData(docRef.id);
        image.progress = 100;
      })
      .catch(error => {
        console.error("Error adding image document: ", error);
      });
    return imageRef;
  }

  addImageData(imageKey: string) {
    const imageData: ImageViewData = {
      $key: imageKey,
      totalViews: 0,
      userViews: [
        {
          user: this.userEmail,
          viewCount: 0,
          longestView: 0
        }
      ]
    };
    this.dataService.addImageData(imageData);
  }

  async uploadFile(upload: Upload, privacy: string, file: File): Promise<string> {
    const filePath = "/images/" + privacy + "/" + upload.collection + "/" + file.name;
    upload.path = filePath;

    const db = this.db;
    const uploadTask = this.storage.upload(filePath, file);
    const user = this.userEmail;
    const dataService = this.dataService;

    const addImageData = (imageKey: string) => {
      const imageData: ImageViewData = {
        $key: imageKey,
        totalViews: 0,
        userViews: [
          {
            user: user,
            viewCount: 0,
            longestView: 0
          }
        ]
      };
      dataService.addImageData(imageData);
    }

    const saveFileData = (uploaded: Upload) => {
      db.collection(uploaded.collection)
        .add(Object.assign({}, uploaded))
        .then(docRef => {
          if (docRef) {
            docRef.update({ $key: docRef.id, progress: 100 });
            addImageData(docRef.id);
            uploaded.progress = 100;
          }
        })
        .catch(error => console.error("Error adding image document: ", error));
    }

    const uploadProgress = (percent: number) => {
      upload.progress = Math.round(percent - (percent * 0.1));
    }

    // monitor progress
    this.uploadPercent = uploadTask.percentageChanges();
    this.uploadPercent.subscribe((percent: number | undefined) => {
      if (percent !== undefined) {
        uploadProgress(percent);
      }
    });

    //function uploadedURL(url: string) {
    //  upload.url = url;
    //  if (url) {
    //    saveFileData(upload);
    //  }
    //}

    await uploadTask.task
      .then(() => {
        saveFileData(upload);
        //snapshot.ref.getDownloadURL()
        //  .then(url => {
        //    if (url) {
        //      uploadedURL(url);
        //      upload.progress = 95;
        //    }
        //  })
        //  .catch(error => console.log('Upload Service: Error getting download URL: ', error));
      })
      .catch(error => console.log('Error uploading file: ', file.name, '\n Error: ', error));

    return filePath;
  }

}
