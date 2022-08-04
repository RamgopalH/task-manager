import { HttpErrorResponse, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, empty, EMPTY, Observable, Subject, switchMap, tap, throwError } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class WebRequestInterceptor implements HttpInterceptor{

  refreshingAccessToken?: boolean;

  accessTokenRefreshed: Subject<any> = new Subject();

  constructor(private authService: AuthService) { }

  intercept(req:HttpRequest<any>, next: HttpHandler): Observable<any> {
    req = this.addAuthHeader(req);
    return next.handle(req).pipe(
      catchError((error:HttpErrorResponse) => {
        if(error.status === 401 && !this.refreshingAccessToken) {
          //Unauthorized Error
          //Try Refreshing Access Token
          return this.refreshAccessToken().pipe(
            switchMap(()=> {
              req = this.addAuthHeader(req);
              return next.handle(req);
            }),
            catchError((err: any) => {
              //if that doesn't work, logout
              console.log(err);
              this.authService.logout();
              return empty();
            })
          )
        }
        return throwError(() => error);
      })
    )
  }

  refreshAccessToken() {
    if(this.refreshingAccessToken) {
      return new Observable(observer => {
        this.accessTokenRefreshed.subscribe(() => {
          observer.next();
          observer.complete();
        });
      });
    } else {
      this.refreshingAccessToken = true;
      //Call a method in the auth  service to call a request to refreseh teh sccesstoken
      return this.authService.getNewAccessToken().pipe(
        tap(() => {
          this.refreshingAccessToken = false;
          console.log("Access Token Refreshed at " + Date.now())
        })
      )
    }
  }

  private addAuthHeader(req: HttpRequest<any> ) {
    //Gets Auth Token, Appends it to the request headers
    const token = this.authService.getAccessToken();
    if(token) {
      return req.clone({
        setHeaders: {
          'x-access-token': token
        }
      });
    }

    return req;
  }
}
