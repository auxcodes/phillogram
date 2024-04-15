import { Component, OnInit, Input } from '@angular/core';
import { ImageViewData } from '../models/imageViewData.model';
import { UserViewData } from '../models/userViewData.model';

@Component({
  selector: 'app-image-data',
  templateUrl: './image-data.component.html',
  styleUrls: ['./image-data.component.scss']
})
export class ImageDataComponent implements OnInit{

  @Input() imageData!: ImageViewData;
  viewData!: UserViewData;
  dateFormat = "yyyy/MM/dd HH:mm:ss";

  constructor() { }

  ngOnInit() {
    this.imageData = { $key: 'loading...' };
  }

}
