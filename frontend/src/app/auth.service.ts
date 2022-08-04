import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { shareReplay, tap } from 'rxjs/operators';
import { WebRequestService } from './web-request.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private http:HttpClient, private webReq: WebRequestService, private router: Router) { }

  login(email: string, password: string) {
    return this.webReq.login(email, password).pipe(
      shareReplay(),
      tap((res: HttpResponse<any>) => {
        //the auth tokens are in the header of http response
        this.setSession(res.body._id, res.headers.get('x-access-token'), res.headers.get('x-refresh-token'));
        console.log('Logged In');
      })
    );
  }

  signup(email: string, password: string) {
    return this.webReq.signup(email, password).pipe(
      shareReplay(),
      tap((res: HttpResponse<any>) => {
        //the auth tokens are in the header of http response
        this.setSession(res.body._id, res.headers.get('x-access-token'), res.headers.get('x-refresh-token'));
        console.log('Successfully Signed Up and Logged in');
      })
    );
  }
  
  logout() {
    this.removeSession();
    this.router.navigateByUrl('/login')
  }

  getAccessToken() {
    return localStorage.getItem('x-access-token');
  }

  getUserId() {
    return localStorage.getItem('userId');
  }

  setAccessToken(accessToken: string) {
    localStorage.setItem('x-access-token', accessToken);
  }
  
  getRefreshToken() {
    return localStorage.getItem('x-refresh-token');
  }
  
  getNewAccessToken() {
    return this.http.get(`${this.webReq.ROOT_URL}/users/me/access-token`, {
      headers: {
        'x-refresh-token': this.StringNullConverter(this.getRefreshToken()),
        '_id': this.StringNullConverter(this.getUserId())
      },
      observe: 'response'
    }).pipe(
      tap((response: HttpResponse<any>) => {
        this.setAccessToken(this.StringNullConverter(response.headers.get('x-access-token')));
      })
    )
  }

  private setSession(userId: string, accessToken: string | null, refreshToken: string | null) {
    localStorage.setItem('userId', userId);
    if (accessToken && refreshToken) {
      localStorage.setItem('x-access-token', accessToken);
      localStorage.setItem('x-refresh-token', refreshToken);
    }
  }
  private removeSession() {
    localStorage.removeItem('userId');
    localStorage.removeItem('x-access-token');
    localStorage.removeItem('x-refresh-token');
  }

  private StringNullConverter(s: string | null): string {
    return (s)?s:'';
  }
  
}
