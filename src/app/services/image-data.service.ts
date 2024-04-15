import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { ImageViewData } from '../models/imageViewData.model';

@Injectable({
  providedIn: 'root'
})
export class ImageDataService {

  private uid: string = '';
  private collectionName = 'imageData';
  private dateNow: Date = new Date();

  constructor(private afAuth: AngularFireAuth, private db: AngularFirestore) {
    this.afAuth.authState.subscribe(auth => {
      if (auth !== undefined && auth !== null) {
        this.uid = auth.uid;
      }
    });
  }

  addImageData(imageData: ImageViewData) {
    this.db.collection(this.collectionName).doc(imageData.$key).set(imageData)
      .catch(error =>  console.log("Error adding image view data:", error));
  }

  updateImageData(imageData: ImageViewData) {
    if (imageData && imageData.$key) {
      this.db.collection(this.collectionName).doc(imageData.$key).update(imageData)
        .catch(error => console.log("Error updating image view data:", error));
    }
  }

  getImageData(dataKey: string) {
    return this.db.collection(this.collectionName).doc(dataKey).ref.get()
      .then((doc) => {
        if (doc.exists) {
          return doc.data();
        }
        else {
          return { totalViews: 0, userViews: [{}] };
        }
      })
      .catch((error) => console.log("Error getting image view data:", error));
  }

  getCurrentDate() {
    return this.dateNow.getTime();
  }
}
