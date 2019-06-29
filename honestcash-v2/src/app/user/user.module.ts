import {NgModule} from '@angular/core';
import {UserContainerComponent} from './user-container.component';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {SharedModule} from '../../core/shared.module';
import {UserRoutingModule} from './user-routing.module';


@NgModule({
  declarations: [
    UserContainerComponent,
  ],
  imports: [
    FormsModule,
    UserRoutingModule,
    CommonModule,
    SharedModule,
  ],
  providers: [],
  bootstrap: [UserContainerComponent]
})
export class UserModule {
}
