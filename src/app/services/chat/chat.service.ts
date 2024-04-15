import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import firestore from 'firebase/compat/app';
import { Router } from '@angular/router';
import { map, switchMap } from 'rxjs/operators';
import { Observable, combineLatest, of, BehaviorSubject } from 'rxjs';
import { AuthenticationService } from '../authentication.service';
import { UploadService } from '../../services/upload.service';
import { Upload } from '../../models/upload.model';

@Injectable({
  providedIn: 'root'
})
export class ChatService {

  private puid = 'X9G2Y3T9koM844Oj70X9eEAp6Gw1';
  cuid = 'btalO8U6yHyMaz9tgF5p';
  unreadMessages: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  constructor(
    private afs: AngularFirestore,
    private auth: AuthenticationService,
    private us: UploadService,
    private router: Router
  ) { }

  get(chatId: string | undefined) {
    return this.afs
      .collection<any>('chats')
      .doc(chatId)
      .snapshotChanges()
      .pipe(
        map(doc => {
          const chatData = doc.payload.data();
          return {
            id: doc.payload.id, chatData
          };
        })
      );
  }

  getChatUpdates() {
    this.auth.authUser().subscribe(user => {
      if (!user) {
        return;
      }
      this.afs.collection<any>('chats', ref => ref.where('uid', '==', user.uid))
        .valueChanges().subscribe(chats => {
          if (chats) {
            let result = false;
            for (const chat of chats) {
              if (chat.unreadMsg > 0) {
                result = true;
              }
            }
            this.unreadMessages.next(result);
          }
        })
    });
  }

  getUserChats() {
    return this.auth.authUser().pipe(
      switchMap(user => {
        if (user) {
          return this.afs
            .collection('chats')
            .snapshotChanges()
            .pipe(
              map(actions => {
                return actions.map(a => {
                  const chatData = a.payload.doc.data();
                  const id = a.payload.doc.id;
                  return { id, chatData };
                });
              })
            );
        } else {
          return of([]); // Return an empty observable if user is null or undefined
        }
      })
    );
  }

  getAdminChats() {
    return this.auth.authUser().pipe(
      switchMap(user => {
        return this.afs
          .collection('chats')
          .snapshotChanges()
          .pipe(
            map(actions => {
              return actions.map(a => {
                const chatData = a.payload.doc.data();
                const id = a.payload.doc.id;
                return { id, chatData };
              });
            })
          );
      })
    );
  }

  async createChat() {
    await this.auth.authUser().subscribe(user => {
      if (!user) {
        this.router.navigate(['/login']);
        return;
      }
      const uid = user.uid;

      let message = {}

      if (!this.auth.canUpload()) {
        message = {
          uid: this.puid,
          content: 'Hi! Send me message or pic to say hi!',
          createdAt: Date.now()
        };
      }

      const data = {
        unreadMsg: 0,
        uid,
        puid: this.puid,
        createdAt: Date.now(),
        count: 0,
        messages: [message]
      };

      this.afs.collection('chats').add(data);
    });
  }

  async deleteChat(chatId: string) {
    if (this.auth.canUpload()) {
      return this.afs.collection('chats').doc(chatId).delete()
        .catch(error => console.log("Error deleting chat:", error));
    }
  }

  async updateRead(chatId: string | undefined) {
    if (!chatId) {
      return;
    }
    await this.auth.authUser().subscribe(user => {
      if (!user) {
        return;
      }
      const uid = user.uid;
      const ref = this.afs.collection('chats').doc(chatId);

      ref.get().subscribe(chat => {
        const chatData: any = chat.data(); 
        if (chatData.uid === uid) {
          return ref.update({
            unreadMsg: 0
          });
        }
        else {
          return ref.update({
            count: 0
          });
        }
      });
    });
  }

  async sendMessage(chatId: string, content: { text: any; url: any; name: any; }) {
    await this.auth.authUser().subscribe(user => {
      if (!user) {
        return;
      }
      const uid = user.uid;

      const data = {
        uid,
        content: content.text,
        imageUrl: content.url,
        imageRef: '',
        imageName: content.name,
        createdAt: Date.now()
      };

      if (content.url !== '') {
        const image = new Upload();
        image.name = content.name;
        image.collection = this.cuid;
        image.url = content.url;
        this.us.addImage(image).subscribe(ref => {
          if (ref) {
            data.imageRef = ref;
            this.sendContent(uid, chatId, data);
          }
        });
      }
      else {
        this.sendContent(uid, chatId, data);
      }
    });

  }

  private sendContent(uid: string, chatId: string, data: any) {
    const fs = firestore.firestore;
    if (uid) {
      const ref = this.afs.collection('chats').doc(chatId);
      let unreadCount = 0;
      let otherCount = 0;
      ref.get().subscribe(chat => {
        const chatData: any = chat.data();
        if (chatData.uid === uid) {
          otherCount = chatData.count + 1;
        }
        else {
          unreadCount = chatData.unreadMsg + 1;
        }
        return ref.update({
          count: otherCount,
          unreadMsg: unreadCount,
          messages: fs.FieldValue.arrayUnion(data)
        });
      });
    }
    else {
      console.log('Cant send message, no uid');
    }
  }

  async deleteMessage(chat: { id: string | undefined; uid: string; }, msg: { uid: string; user: any; }) {
    await this.auth.authUser().subscribe(user => {
      if (!user) {
        return;
      }
      const uid = user.uid;

      const ref = this.afs.collection('chats').doc(chat.id);
      const fs = firestore.firestore;
      if (chat.uid === uid || msg.uid === uid || this.auth.canUpload()) {
        // Allowed to delete
        delete msg.user;
        return ref.update({
          messages: fs.FieldValue.arrayRemove(msg)
        });
      }
      else {
        return;
      }
    });
  }

  joinUsers(chat$: Observable<any>) {
    let chat: { messages: any[] | undefined; };

    return chat$.pipe(
      switchMap(c => {
        // Unique User IDs
        chat = c.chatData;
        let uids = [];
        if (chat && chat.messages !== undefined) {
          uids = Array.from(new Set(chat.messages.map(v => v.uid)));
        }
        // Firestore User Doc Reads
        const userDocs = uids.map(u =>
          this.afs.doc(`users/${u}`).valueChanges()
        );

        return userDocs.length ? combineLatest(userDocs) : of([]);
      }),
      map(arr => {
        const joinKeys: { [key: string]: any } = {}; // Define the type of joinKeys
        arr.forEach((v: any) => (joinKeys[v.uid] = v)); // Use type assertion to specify the type of 'v' as 'any'
        if (chat && chat.messages !== undefined) {
          chat.messages = chat.messages.map(v => {
            return { ...v, user: joinKeys[v.uid] };
          });
        }

        return chat;
      })
    );
  }

  joinChatOwners(chats$: Observable<any>) {
    let chats: any[] = [];

    return chats$.pipe(
      switchMap(c => {
        // Unique User IDs
        chats = c;
        let uids = [];
        if (chats !== undefined) {
          uids = Array.from(new Set(chats.map(v => {
            return v.chatData.uid;
          })));
        }
        // Firestore User Doc Reads
        const userDocs = uids.map(u => {
          return this.afs.doc(`users/${u}`).valueChanges();
        });
        userDocs.push(this.afs.doc(`users/${this.puid}`).valueChanges());

        return userDocs.length ? combineLatest(userDocs) : of([]);
      }),
      map(arr => {
        const joinKeys: { [key: string]: any } = {}; // Define the type of joinKeys
        arr.forEach(v => {
          joinKeys[(<any>v).uid] = v;
        });
        if (chats !== undefined) {
          chats = chats.map((v: any) => {
            return { ...v, user: joinKeys[v.chatData.uid], pUser: joinKeys[v.chatData.puid] };
          });
        }
        return chats;
      })
    );
  }

}
