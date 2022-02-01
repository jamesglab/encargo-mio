import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { map, catchError } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';

import { header, handleError } from 'src/app/_helpers/tools/header.tool';
import { StorageService } from '../../_services/storage.service';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UsersService {

  constructor(private httpClient: HttpClient) { }

  addUser(payload: any): Observable<{ message: string }> {
    return this.httpClient.post<any>(
      `${environment.microservices.management}users`, payload, { headers: header })
      .pipe(map((res: any) => { return res; }), catchError(handleError));
  }

}
