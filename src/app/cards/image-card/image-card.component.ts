import { Component, OnInit, Input } from '@angular/core';
import { GalleryImage } from '../../models/galleryImage.model';

@Component({
  selector: 'app-image-card',
  templateUrl: './image-card.component.html',
  styleUrls: ['./image-card.component.scss']
})
export class ImageCardComponent implements OnInit {

  imageSrc: string = 'assets/icons/image_default.svg';
  @Input() image!: GalleryImage;

  constructor() { }

  ngOnInit() {
    this.imageSrc = this.image.url || '';
  }

}
