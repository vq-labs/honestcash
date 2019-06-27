import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';

/**
 * - More specific routes should come first
 * - Every module here is lazy-loaded
 */
const routes: Routes = [
  {
    path: 'editor',
    loadChildren: './editor/editor.module#EditorModule'
  },
  {
    path: '',
    loadChildren: './main/main.module#MainModule'
  },
  {
    path: '',
    loadChildren: './brand/brand.module#BrandModule'
  },
  {
    path: '',
    loadChildren: './auth/auth.module#AuthModule'
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
