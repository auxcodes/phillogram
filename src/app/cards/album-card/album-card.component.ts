import { Component, OnInit, Input, OnChanges } from '@angular/core';
import { Album } from '../../models/album.model';

@Component({
  selector: 'app-album-card',
  templateUrl: './album-card.component.html',
  styleUrls: ['./album-card.component.scss']
})
export class AlbumCardComponent implements OnInit, OnChanges {

  spinner: string = 'assets/icons/image_default.svg';
  selectedImage: number = 0;
  lastActive: string | undefined = '';
  @Input() album!: Album;

  constructor() { }

  ngOnInit() {
  }

  ngOnChanges() {

  }

  onNext(event: any) {
    if (!this.album.images) {
      return
    }
    
    this.lastActive = this.album.images[this.selectedImage].$key;

    if (this.selectedImage < (this.album.images.length - 1)) {
      this.selectedImage++;
    }
    else {
      this.selectedImage = 0;
    }
    let activeImage = this.album.images[this.selectedImage]?.$key ?? '';

    const lastActive = this.lastActive ?? '';
    this.carouselColors(lastActive, activeImage);
  }

  onPrevious(event: any) {
    if (!this.album.images) {
      return
    }
    this.lastActive = this.album.images[this.selectedImage].$key;
    if (this.selectedImage > 0) {
      this.selectedImage--;
    }
    else {
      this.selectedImage = (this.album.images.length - 1);
    }

    let activeImage = this.album.images[this.selectedImage].$key ?? '';

    const lastActive = this.lastActive ?? '';
    this.carouselColors(lastActive, activeImage);
  } 

  onClick(event: any) {
    if (!this.album.images) {
      return
    }
    if (this.lastActive == event.target.id)
      return;
    if (this.lastActive == '') {
      this.lastActive = this.album.images[0].$key;
    }

    const lastActive = this.lastActive ?? '';
    this.carouselColors(lastActive, event.target.id);

    this.lastActive = event.target.id;
    this.selectedImage = this.album.images.findIndex(image => image.$key === event.target.id);
  }

  private carouselColors(inactiveId: string, activeId: string) {
    const activeImage = document.getElementById(activeId);
    const inactiveImage = document.getElementById(inactiveId);


    if (this.album.images && this.album.images.length > 1 && activeImage) {
      if (inactiveId !== '' && inactiveImage) {
        inactiveImage.className = 'dot';
      }
      activeImage.className = 'active-dot';
    }
  }

  imageUrl(selectedImage: number) {
    if (this.album && this.album.images) {
      return this.album.images[selectedImage].url;
    }
    else {
      return '';
    }
  }

  albumImagesCount() {
    const count: number = this.album.images ? this.album.images.length : 0;
  
    return count;
  }

}
