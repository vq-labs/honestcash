import { Component, OnInit, HostBinding } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';

import { AppState, selectAuthState } from '../../../../store/app.states';
import { LogIn } from '../../../../store/auth/auth.actions';
import { NgForm } from '@angular/forms';
import User from '../../../../models/user';

interface LoginForm extends NgForm {
  value: {
    email: string;
    password: string;
  };
}

@Component({
  selector: 'app-welcome-page-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  @HostBinding('class') class = 'w-full';
  @HostBinding('style.height') height = '65vh';
  @HostBinding('style.minHeight') minHeight = '65vh';

  isLoading = false;
  user = new User();

  constructor(
    private store: Store<AppState>
  ) {}

  ngOnInit() {}

  onSubmit(form: LoginForm): void {
    this.isLoading = true;

    const payload = form.value;

    // this.store.dispatch(new LogIn(payload));
  }

}
