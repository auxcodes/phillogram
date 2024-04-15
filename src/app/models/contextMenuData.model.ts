import { AlbumRoles } from './albumRoles.model';
import { ContextMenuType } from './contextMenuType.model';

export class ContextMenuData {
  $event?: any;
  objectType?: ContextMenuType;
  albumId?: string;
  imageId?: string;

  constructor(event: any, albumId: string, imageId?: string) {
    this.$event = event;
    this.objectType = imageId ? ContextMenuType.Image : ContextMenuType.Album;
    this.albumId = albumId;
    this.imageId = imageId;
  }
}
