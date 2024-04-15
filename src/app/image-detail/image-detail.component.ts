import { Component, OnInit, OnDestroy} from '@angular/core';
import { Subscription, timer } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { ImageService } from '../services/image.service';
import { AlbumService } from '../services/pages/album.service';
import { Album } from '../models/album.model';
import { ImageDataService } from '../services/image-data.service';
import { AuthenticationService } from '../services/authentication.service';
import { ImageViewData } from '../models/imageViewData.model';
import { UserViewData } from '../models/userViewData.model';
import { AlbumRoles } from '../models/albumRoles.model';
import { GalleryImage } from '../models/galleryImage.model';

@Component({
  selector: 'app-image-detail',
  templateUrl: './image-detail.component.html',
  styleUrls: ['./image-detail.component.scss']
})
export class ImageDetailComponent implements OnInit, OnDestroy {

  album: Album;
  imageData: ImageViewData;
  imageUrl = '';
  imageObject: GalleryImage = {$key: 'loading...'};

  private userKey: string = ''; 
  private viewTime = 0;
  private timerSub!: Subscription;
  private userViewData!: UserViewData;
  private isInit = false;
  private user!: Subscription;
  private userEmail = 'undefined@undefined.com';

  constructor(
    private imageService: ImageService,
    private albumService: AlbumService,
    private dataService: ImageDataService,
    private authService: AuthenticationService,
    private route: ActivatedRoute,
    private location: Location) {
    this.album = new Album('loading...', AlbumRoles.guest, []);
    this.imageData = { totalViews: 0, userViews: [{}] };
  }

  ngOnInit() {
    this.init();
  }

  ngOnDestroy() {
    if (this.isInit) {
      this.timerSub.unsubscribe();
      this.updateViewTime(this.viewTime, this.userViewData.longestView || 0);
      this.dataService.updateImageData(this.imageData);
    }
  }

  canViewData() {
    return this.authService.canUpload();
  }

  onBack() {
    this.location.back();
  }

  private init() {
    this.timerSub = timer(0, 1000).subscribe(t => this.viewTime = t);
    this.getImageUrl(this.route.snapshot.params['id'], this.route.snapshot.params['album']);
    this.albumService.getAlbum(this.route.snapshot.params['album']).then(
      album => {
        if (album) {
          this.album = album;
        }
      }
    );
    this.user = this.authService.getUserAccount().subscribe(user => this.userEmail = user.email || '');
    this.getImageData(this.route.snapshot.params['id']);
    this.isInit = true;
  }

  private getImageUrl(imageKey: string, albumKey: string) {
    this.imageService.getImage(imageKey, albumKey).then(image => {
      if (image) {
        this.imageObject = image; 
        this.imageUrl = image.url || '';
      }
    });
    this.imageData = { totalViews: 0 };
    this.userViewData = {user: 'loading...', viewCount: 0, longestView: 0, recentView: 0, lastViewDate: 0, firstViewDate: 0};
  }

  private getImageData(imageKey: string) {
    let imageData: any;
    this.dataService.getImageData(imageKey)
      .then(data => imageData = data)
      .catch(error => console.log("Error getting image view data:", error))
      .finally(
      () => {
        this.imageData = imageData;
        if (this.imageData) {
          this.userViewData = this.findUserData(this.userEmail)
          this.incrementViewCount();
          this.updateViewDate();
          this.dataService.updateImageData(this.imageData);
        }
        else {
          this.imageData = { totalViews: 0, userViews: [{}] }
        }
      });
  }

  private updateViewTime(time: number, longestTime: number) {
    this.userViewData.recentView = time;
    this.userViewData.longestView = (time > longestTime) ? time : longestTime;
  }

  private incrementViewCount() {
    if (this.imageData && this.imageData.totalViews) {
      this.imageData.totalViews += 1;
    }
    if (this.userViewData && this.userViewData.viewCount) {
      this.userViewData.viewCount += 1;
    }
  }

  private updateViewDate() {
    this.userViewData.lastViewDate = this.dataService.getCurrentDate();
    if (!this.userViewData.firstViewDate) {
      this.userViewData.firstViewDate = this.dataService.getCurrentDate();
    }
  }

  private findUserData(user: string) {
    let userViewData: UserViewData = {};
    if (this.imageData.userViews){
      userViewData = this.imageData.userViews.find((item) => item.user === user) || this.emptyUserdata(user);
    }
    if (userViewData) {
      return userViewData;
    }
    else {
      userViewData = this.emptyUserdata(user);
      if (this.imageData.userViews) {
        this.imageData.userViews.push(userViewData);
      }
      return userViewData;
    }
  }

  private emptyUserdata(user: string): UserViewData {
    return { user: user, viewCount: 0, longestView: 0, recentView: 0, lastViewDate: 0, firstViewDate: 0 }
  }
}
