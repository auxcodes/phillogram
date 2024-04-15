export class Upload {
  album: string;
  caption: string;
  collection: string;
  createdOn: Date;
  $key: string;
  name: string;
  path: string; 
  progress: number;
  url: string;

  constructor() {
    this.createdOn = new Date();
    this.$key = '';
    this.album = '';
    this.caption = '';
    this.collection = '';
    this.name = '';
    this.path = '';
    this.progress = 0;
    this.url = '';
  }
}
