import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { MainWindowComponent } from './pages/main-window/main-window.component';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { NewListWindowComponent } from './pages/new-list-window/new-list-window.component';
import { NewTaskWindowComponent } from './pages/new-task-window/new-task-window.component';
import { LoginWindowComponent } from './pages/login-window/login-window.component';
import { WebRequestInterceptor } from './web-request.interceptor';
import { SignupWindowComponent } from './pages/signup-window/signup-window.component';

@NgModule({
  declarations: [
    AppComponent,
    MainWindowComponent,
    NewListWindowComponent,
    NewTaskWindowComponent,
    LoginWindowComponent,
    SignupWindowComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule
  ],
  providers: [
    {provide: HTTP_INTERCEPTORS, useClass: WebRequestInterceptor, multi: true},
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
