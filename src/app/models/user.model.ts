import firebase from "firebase/compat";

export class User {
  uid?: string;
  email?: string;
  photoURL?: string;
  roles?: string[];
  displayName?: string;

  constructor(authData: firebase.User) {
    this.uid = authData.uid;
    this.email = authData.email || undefined;
    this.photoURL = authData.photoURL || undefined;
    this.roles = authData.uid ? ['guest','viewer'] : ['guest'];
    this.displayName = authData.displayName || undefined;
  }
}
