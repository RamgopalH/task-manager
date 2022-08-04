import { HttpResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/auth.service';

@Component({
  selector: 'app-login-window',
  templateUrl: './login-window.component.html',
  styleUrls: ['./login-window.component.scss']
})
export class LoginWindowComponent implements OnInit {

  constructor(private authService:AuthService) { }

  ngOnInit(): void {
  }

  OnLoginButtonClicked(email: string, password: string) {
    this.authService.login(email, password).subscribe((res:HttpResponse<any>) => {
      
    });
  }

}
