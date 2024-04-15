import { Component, OnInit, OnChanges } from '@angular/core';
import { UploadService } from '../../services/upload.service';
import { Upload } from '../../models/upload.model';
import { AlbumService } from '../../services/pages/album.service';
import { Album } from '../../models/album.model';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import { AuthenticationService } from '../../services/authentication.service';
import { AlbumRoles } from '../../models/albumRoles.model';

@Component({
  selector: 'app-upload',
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.scss']
})
export class UploadComponent implements OnInit, OnChanges {
  files: FileList = new FileList();
  albumKey = '';
  upload: Upload = new Upload();
  albums!: Observable<Album[]>;
  albumId: string | undefined = undefined;
  selectedAlbum: Album = new Album('', 1, []);
  selectedPrivacy: number | undefined;
  selected = false;

  imagePreviewSrc: any[] = [];
  fileNames = '';

  constructor(
    private uploadService: UploadService,
    private albumService: AlbumService,
    private authService: AuthenticationService,
    private router: Router) {
  }

  ngOnInit() {
    if (!this.authService.canUpload()) {
      this.router.navigate(['login']);
    }
    else {
      this.albums = this.albumService.getAllAlbums();
    }
  }

  ngOnChanges() {
    this.albums = this.albumService.getAllAlbums();
  }

  handleFiles(event: any) {
    this.files = event.target.files;
    this.imagePreview();
    this.upload = new Upload();
  }

  private imagePreview() {
    const fileCount = this.files.length;
    for (let i = 0; i < fileCount; i++) {
      const file = this.files[i];
      this.fileNames = this.fileNames.concat(file.name, ', ');
      const reader = new FileReader();
      reader.onload = e => this.imagePreviewSrc.push(reader.result);
      reader.readAsDataURL(file);
    }
  }

  selectChangeHandler(event: any) {
    if (event.target.value === 'undefined' || event.target.value === 'addAlbum') {
      this.albumId = event.target.value;
      this.selected = false;
    }
    else {
      this.albumId = this.selectedAlbum.name ?? '';
      this.selected = true;
    }
  }

  onUpload() {
    this.uploadFiles();
  }

  private async uploadFiles() {
    const count = this.files.length;
    for (let i = 0; i < count; i++) {
      this.upload = new Upload();
      this.upload.name = this.files[i].name;
      this.upload.collection = this.selectedAlbum.$key ?? '';
      const role = this.selectedAlbum.role ?? '3';
      await this.uploadService.uploadFile(this.upload, role, this.files[i])
        .then(() => {
          if (i === (count - 1)) {
            this.updateImageCount(this.upload.collection, count);
          }
        })
        .catch(error => console.log('upload error: ', error))
    }
  }

  private updateImageCount(albumKey: string, imageCount: number) {
    this.albumService.updateAlbumImageCount(albumKey, imageCount);
    this.imagePreviewSrc = [];
    this.resetForm();
  }

  addAlbum(name: any, privacy: any) {
    this.albumService.addAlbum(new Album(name, privacy, []))
      .then(() => this.resetForm())
      .catch(error => console.log('Error adding album: ', error));
  }

  private resetForm() {
    this.selected = false;
    this.albumId = 'undefined';
    this.upload = new Upload();
    this.fileNames = '';
  }
}
