import { Component, OnInit} from '@angular/core';

import { ContactService } from '../../services/pages/contact.service';

@Component({
  selector: 'app-submit',
  templateUrl: './submit.component.html',
  styleUrls: ['./submit.component.scss']
})
export class SubmitComponent implements OnInit {

  selected = false;
  message = '';

  files!: FileList | undefined;
  imagePreviewSrc: any[] = [];
  fileNameList: string[] = [];
  fileNames = '';

  constructor(   
    private contactService: ContactService) {

  }

  ngOnInit() {

  }

  handleFiles(event: any) {
    this.resetBrowseForm();
    this.files = event.target.files;
    this.imagePreview();
  }

  private imagePreview() {
    if (this.files) {
      const count = this.files.length;
      for (let i = 0; i < count; i++) {
        const file = this.files[i];
        this.contactService.tempImages(file);
        this.fileNameList.push(file.name);
        const reader = new FileReader();
        reader.onload = () => this.imagePreviewSrc.push(reader.result);
        reader.readAsDataURL(file);
      }
      this.fileNames = this.fileNameList.map(x => x).join(', ');
    }
  }

  resetBrowseForm() {
    this.imagePreviewSrc = [];
    this.fileNameList = [];
    this.fileNames = '';
    this.files = undefined;
  }

  sendMessage() {
      const files = this.files || undefined;
      this.contactService.sendMessage(this.message, files);
      this.resetBrowseForm();
      this.message = '';
  }

  removeImage(index: number) {
    this.fileNameList.splice(index, 1);
    this.fileNames = this.fileNameList.map(x => x).join(', ');
    this.imagePreviewSrc.splice(index, 1);
  }
}
