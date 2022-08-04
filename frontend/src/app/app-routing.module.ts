import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginWindowComponent } from './pages/login-window/login-window.component';
import { MainWindowComponent } from './pages/main-window/main-window.component';
import { NewListWindowComponent } from './pages/new-list-window/new-list-window.component';
import { NewTaskWindowComponent } from './pages/new-task-window/new-task-window.component';
import { SignupWindowComponent } from './pages/signup-window/signup-window.component';

const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'new-list', component: NewListWindowComponent },
  { path: 'lists', component: MainWindowComponent },
  { path: 'lists/:listId', component: MainWindowComponent },
  { path: 'lists/:listId/new-task', component: NewTaskWindowComponent },
  { path: 'login', component: LoginWindowComponent },
  { path: 'signup', component: SignupWindowComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
