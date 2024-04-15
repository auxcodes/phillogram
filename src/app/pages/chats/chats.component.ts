import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { ChatService } from '../../services/chat/chat.service';
import { AuthenticationService } from '../../services/authentication.service';

@Component({
  selector: 'app-chats',
  templateUrl: './chats.component.html',
  styleUrls: ['./chats.component.scss']
})
export class ChatsComponent implements OnInit {

  userChats$!: Observable<any>;
  userProfile!: Observable<any>;
  
  constructor(public auth: AuthenticationService, public cs: ChatService) { }

  ngOnInit() {
    this.auth.rolesReady.subscribe(ready => {
      if (ready) {
        const source = this.auth.canUpload() ? this.cs.getAdminChats() : this.cs.getUserChats();

        this.userChats$ = this.cs.joinChatOwners(source);

        this.userChats$.subscribe(chats => {
          if (chats.length < 1 && !this.auth.canUpload()) {
            this.cs.createChat();
          }
        });
      }
    });
  }


}
