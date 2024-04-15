import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UploadService } from '../../services/upload.service';
import { Upload } from '../../models/upload.model';
import { AlbumService } from '../../services/pages/album.service';
import { Album } from '../../models/album.model';
import { AuthenticationService } from '../../services/authentication.service';
import { Privacy } from '../../models/privacy.model';

@Component({
  selector: 'app-add-images',
  templateUrl: './add-images.component.html',
  styleUrls: ['./add-images.component.scss']
})
export class AddImagesComponent implements OnInit {

  files: FileList = new FileList;
  upload: Upload = new Upload();
  selectedAlbum!: Album;
  imagePreviewSrc: (string|ArrayBuffer)[] = [];
  fileNames = '';

  privacyList: Privacy[] = [
    { name: 'feed', text: 'Feed', value: '0' },
    { name: 'posts', text: 'Posts', value: '1' },
    { name: 'story', text: 'Story', value: '2' },
    { name: 'private', text: 'Private', value: '3' }
  ];

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
  }

  handleFiles(eventTarget: any) {
    const fileList: FileList = eventTarget.files;

    if (fileList){
      this.files = fileList;
      this.imagePreview(fileList);
      this.upload = new Upload();
    }
  }

  private imagePreview(files: FileList) {
    const fileCount = files.length;
    for (let i = 0; i < fileCount; i++) {
      if (files.item(i)) {
        const fileName = files.item(i)!.name;
        this.fileNames = this.fileNames.concat(fileName, ', ');
        const reader = new FileReader();
        reader.onload = () => this.imagePreviewSrc.push(reader.result || '');
        reader.readAsDataURL(files.item(i) as Blob);
      }
    }
  }

  async onUpload(name: string, privacy: string) {
    const album = new Album(name, +privacy, []);
    await this.albumService.addAlbum(album)
      .then(albumKey => {
        console.log('albumKey: ', albumKey)
        if (albumKey) {
          console.log("album added");
          album.$key = albumKey as string; 
          this.uploadImages(album);
        }
        else{
          console.log('Something went wrong creating image album?');
        }
      })
      .catch(error => console.log('Error adding album: ', error));
  }

  private async uploadImages(album: Album) {
    const count = this.files.length;
    const imagePaths: string[] = [];
    const albumKey = album.$key;
    if (albumKey) {
      for (let i = 0; i < count; i++) {
        this.upload = new Upload();
        this.upload.name = this.files[i].name;
        this.upload.collection = albumKey;
        await this.uploadService.uploadFile(this.upload, album.role ?? '3', this.files[i])
          .then(filePath => {
            imagePaths.push(filePath);
            if (i === (count - 1)) {
              this.updateImageCount(this.upload.collection, count);
            }
          })
          .catch(error => console.log('upload error: ', error))
      }
      console.log(imagePaths);
      this.albumService.updateAlbumImageList(albumKey, imagePaths);
    }
  }

  private updateImageCount(albumKey: string, imageCount: number) {
    this.albumService.updateAlbumImageCount(albumKey, imageCount);
    this.imagePreviewSrc = [];
    this.resetForm();
  }

  private resetForm() {
    this.upload = new Upload();
    this.fileNames = '';
  }

}
