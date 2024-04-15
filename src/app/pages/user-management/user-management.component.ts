import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AngularFireAuth } from '@angular/fire/compat/auth';

@Component({
  selector: 'app-user-management',
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.scss']
})
export class UserManagementComponent implements OnInit {

  private accountEmail: string = '';
  private actionCode: string = '';

  newPassword = '';
  confirmPassword = '';
  errorMessage = '';
  confirmMessage = '';

  resetPassword = false;
  recoverEmail = false;
  verifyEmail = false;

  constructor(
    private afAuth: AngularFireAuth,
    private route: ActivatedRoute) {
  }

  ngOnInit(): void {
    const mode = this.route.snapshot.queryParams['mode'];
    const actionCode = this.route.snapshot.queryParams['oobCode'];
    // TODO :: Can this switch be moved to template using ngSwitch?
    switch (mode) {
      case 'resetPassword': {
        console.log('resetPassword');
        this.handleResetPassword({}, actionCode);
        break;
      }
      case 'recoverEmail': {
        this.recoverEmail = true;
        console.log('recoverEmail');
        break;
      }
      case 'verifyEmail': {
        this.verifyEmail = true;
        console.log('verifyEmail');
        break;
      }
      default: {
        this.verifyEmail = false;
        this.resetPassword = false;
        this.recoverEmail = false;
        // route somewhere else
        break;
      }
    }
  }

  private handleResetPassword(auth: any, actionCode: string) {
    const uAuth = auth;
    // Verify the password reset code is valid.
    this.afAuth.verifyPasswordResetCode(actionCode).then(email => {
      this.accountEmail = email;
      this.actionCode = actionCode;
      this.resetPassword = true;

    }).catch(error => {
      // Invalid or expired action code. Ask user to try to reset the password
      // again.
      console.log('Error with password reset: ', error);
      if (error.code === 'auth/invalid-action-code') {
        this.errorMessage = 'The password reset link has expired!'
      }
    });
  }

  onConfirmNewPassword() {
    // Save the new password.
    this.afAuth.confirmPasswordReset(this.actionCode, this.newPassword).then(() => {
      console.log('Password update successful! ');
      this.confirmMessage = 'Password updated successfully!';
      // reset was successful notice
      // Route user somewhere
    }).catch( error => {
      // Error occurred during confirmation. The code might have expired or the
      // password is too weak.
      this.confirmMessage = 'An error occured during password reset';
      console.log('Error with new password: ', error);
      if (error.code === 'auth/invalid-action-code') {
        this.errorMessage = 'The password reset link has expired!'
      }
    });

    this.newPassword = '';
    this.confirmPassword = '';
  }


}
