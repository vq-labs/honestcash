import {NgModule, Optional, SkipSelf} from '@angular/core';
import {CommonModule} from '@angular/common';
import {HttpClient, HttpClientModule} from '@angular/common/http';
import {RouteReuseStrategy, RouterModule} from '@angular/router';
import {RouteReusableStrategy} from './route-strategy/route-reusable-strategy';
import {HttpService} from './http/http.service';
import {HttpCacheService} from './http/http-cache.service';
import {ApiPrefixInterceptor} from './http/api-prefix.interceptor';
import {ErrorHandlerInterceptor} from './http/error-handler.interceptor';
import {CacheInterceptor} from './http/cache.interceptor';

@NgModule({
  imports: [
    HttpClientModule,
  ],
  providers: [
    HttpCacheService,
    ApiPrefixInterceptor,
    ErrorHandlerInterceptor,
    CacheInterceptor,
    {
      provide: HttpClient,
      useClass: HttpService
    },
    {
      provide: RouteReuseStrategy,
      useClass: RouteReusableStrategy
    }
  ]
})
export class CoreModule {
  /* istanbul ignore next */
  constructor(@Optional() @SkipSelf() parentModule: CoreModule) {
    // Import guard
    /* istanbul ignore next */
    if (parentModule) {
      throw new Error(`${parentModule} has already been loaded. Import Core module in the AppModule only.`);
    }
  }
}
