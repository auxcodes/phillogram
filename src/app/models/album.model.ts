import { AlbumRoles } from './albumRoles.model';
import { GalleryImage } from './galleryImage.model';

export class Album {
  $key?: string;
  name?: string;
  size?: number;
  color?: string;
  role?: string;
  images?: GalleryImage[];
  createdOn?: number;

  constructor(name: string, privacy: AlbumRoles, images: GalleryImage[]) {
    this.$key = '0000000000000000000000000000000000000';
    this.name = name;
    this.color = 'hsl(' + (Math.random() * 360) + ', 50%, 50%)';
    this.size = 0;
    this.role = AlbumRoles[privacy];
    this.images = images;
    this.createdOn = (new Date()).getUTCFullYear();
  }
}
