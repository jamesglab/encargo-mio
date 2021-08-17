import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, catchError } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';

import { header, handleError } from 'src/app/_helpers/tools/header.tool';
import { StorageService } from './storage.service';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UserService {


  constructor(private http: HttpClient,

    private router: Router,
    private _storageService: StorageService) {

  }

  createUser(user_type: number, user): Observable<any> {


    return this.http.post<any>(`${environment.microservices.user}user/user/insert_user`, user, { headers: header, params: { user_type: (user_type == 1) ? 'client' : 'company' } }).pipe(
      map((res: any) => {
        return res;
      }),
      catchError(handleError)
    );
  }


}
