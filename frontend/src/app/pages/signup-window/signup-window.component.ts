import { HttpResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/auth.service';

@Component({
  selector: 'app-signup-window',
  templateUrl: './signup-window.component.html',
  styleUrls: ['./signup-window.component.scss']
})
export class SignupWindowComponent implements OnInit {

  constructor(private authService: AuthService) { }

  ngOnInit(): void {
  }

  OnSignUpButtonClicked(email: string, password: string) {
    this.authService.signup(email, password).subscribe((res:HttpResponse<any>) => {
      console.log(res);
    });
  }

}
