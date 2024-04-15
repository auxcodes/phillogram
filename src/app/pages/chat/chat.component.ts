import { Component, OnInit } from '@angular/core';
import { ChatService } from '../../services/chat/chat.service';
import { ActivatedRoute } from '@angular/router';
import { Observable, BehaviorSubject } from 'rxjs';
import { AuthenticationService } from '../../services/authentication.service';
import { UploadService } from '../../services/upload.service';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent implements OnInit {
  chat$!: Observable<any>;
  newMsg = '';
  chatId: string = '';

  image!: File | null;
  imagePreviewSrc: any;
  imageUrl = '';
  private imageLoaded: BehaviorSubject<string> = new BehaviorSubject<string>('');
  private type = 'messages'

  constructor(
    public cs: ChatService,
    private route: ActivatedRoute,
    public auth: AuthenticationService,
    private us: UploadService) { }

  ngOnInit() {
    this.chatId = this.route.snapshot.paramMap.get('id') || '';
    const source = this.cs.get(this.chatId);

    this.chat$ = this.cs.joinUsers(source);
    this.chat$.subscribe(chat => {
      if (chat) {
        this.cs.updateRead(this.chatId);
      }
    });
  }

  submit(chatId: string) {
    if (this.newMsg === '' && this.imageUrl === '') {
      return alert('That is not a message :o');
    }
    this.sendMessage(chatId);
  }

  selectImage(event:  any) {
    this.image = event.target.files[0];
    this.imageLoaded = this.us.getImagePath(this.image as File, this.type);
    this.imageLoaded.subscribe(url => {
      this.imageUrl = url;
    });
    this.imagePreview();
  }

  removeImage() {
    this.imagePreviewSrc = null;
    this.image = null;
    this.imageUrl = '';
    this.imageLoaded.next('');
  }

  private sendMessage(chatId: string) {
    const name = this.image ? this.image.name : '';
    const content = { text: this.newMsg, url: this.imageUrl, name: name };
    this.cs.sendMessage(chatId, content);
    this.newMsg = '';
    this.removeImage();
  }

  private imagePreview() {
    const file = this.image;
    const reader = new FileReader();
    reader.onload = () => this.imagePreviewSrc = reader.result;
    reader.readAsDataURL(file as Blob);
  }

  trackByCreated(i: any, msg: { createdAt: any; }) {
    return msg.createdAt;
  }

  // getMobileOS() {
  //   let userAgent = navigator.userAgent || navigator.vendor;
  //   let result = false;
  //   if (/android/i.test(userAgent)) {
  //     result = true;
  //   }

  //   if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
  //     result = true;
  //   }

  //   return result;
  // }
}
