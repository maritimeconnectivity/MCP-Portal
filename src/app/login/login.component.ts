import { Component, OnInit } from '@angular/core';
import {AuthService} from "../authentication/services/auth.service";

@Component({
  selector: 'app-login',
  styles: [require('./login.scss')],
  templateUrl: './login.component.html'
})
export class LoginComponent implements OnInit {

  constructor(private authService: AuthService) {
  }

  ngOnInit() {
  }

  logIn() {
    this.authService.login();
  }

}
