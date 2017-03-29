import { Injectable } from '@angular/core';
import { Http, Response, RequestOptions, Headers } from '@angular/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs/Rx';
import { ApiUserService } from './api-user.service';
import { ApiBillingService } from './api-billing.service'

@Injectable()
export class ApiService {
  user: ApiUserService;
  billing: ApiBillingService;
  url: String;

  constructor(public http: Http) {
    this.url =  environment.baseUrl;

    this.user = new ApiUserService(this);
    this.billing = new ApiBillingService(this);
  }

  public requestOptions() {
    const headers = new Headers({
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + localStorage.getItem('id_token')
    });
    const requestOptions = new RequestOptions({ headers: headers });
    return requestOptions;
  }

  public extractData(res: Response) {
    return res.json();
  }

  public handleError (error: Response | any) {
    let errMsg: string;
    if (error instanceof Response) {
      const body = JSON.parse(JSON.stringify(error)) || '';
      const err = body.error || JSON.stringify(body);
      errMsg = `${error.status} - ${error.statusText || ''} ${err}`;
    } else {
      errMsg = error.message ? error.message : error.toString();
    }
    console.error(errMsg);
    return Observable.throw(errMsg);
  }

}