import { Component, NgZone } from '@angular/core';
import { AuthenticationService } from '../../services/authentication.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {

  emailLogin: boolean = false;

  email: string = '';
  password: string = '';
  errorMsg: string = '';

  constructor(private ngZone: NgZone, private authService: AuthenticationService, private router: Router) {
    authService.authUser().subscribe(user => {
      if (user) {
        this.navigate(['/home'])
      }
    });
  }

  signIn() {
    this.errorMsg = '';
    this.authService.login(this.email, this.password)
      .then(resolve => {
        this.password = '';
        this.navigate(['/home']);
      })
      .catch(error => this.processError(error));
  }

  googleSignIn() {
    this.authService.googleLogin()
      .then(() => {
        this.errorMsg = '';
        this.navigate(['/home']);
      })
      .catch(error => this.processError(error));
  }

  processError(error: any) {
    if (error.code === 'auth/user-not-found')
      this.errorMsg = '! Account not found, please register :D';
    else
      this.errorMsg = '! Email or Password is incorrect :(';

    console.log(error);
  }

  emailSignIn() {
    this.emailLogin = !this.emailLogin;
  }

  navigate(commands: any[]) {
    this.ngZone.run(() => this.router.navigate(commands))
      .then()
      .catch(error => {
        console.log('navigation error: ', error);
      });
  }

}
