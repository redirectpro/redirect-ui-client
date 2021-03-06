import { Injectable } from '@angular/core';
import { ApiService } from '../api/api.service';
import { ApplicationUserService } from './application-user.service';
import { ApplicationBillingService } from './application-billing.service';
import { ApplicationRedirectService } from './application-redirect.service';
import { EventEmitter } from 'events';
import { Observable } from 'rxjs/Observable';
import { Subscriber } from 'rxjs/Subscriber';

@Injectable()
export class ApplicationService  {
  ready: Boolean = false;
  id: String;
  user: ApplicationUserService;
  billing: ApplicationBillingService;
  redirect: ApplicationRedirectService;
  event: EventEmitter = new EventEmitter();
  loading: number;
  isReady: Observable<boolean> = new Observable<boolean>((observer: Subscriber<boolean>) => {
    if (this.ready === true) {
      observer.next(true);
    } else {
      this.event.on('ready', () => {
        observer.next(true);
      });
    }
  });

  constructor(private apiService: ApiService) {
    this.loading = 0;
    this.user = new ApplicationUserService(this, this.apiService);
    this.billing = new ApplicationBillingService(this, this.apiService);
    this.redirect = new ApplicationRedirectService(this, this.apiService);
    this.event.on('ready', () => { this.ready = true; });
  }

  public initialize() {
    return new Promise((resolve, reject) => {
      this.user.updateProfile().then(() => {
        this.id = this.user.profile['applications'][0].id;
        const p1 = this.billing.updateProfile();
        const p2 = this.billing.updatePlans();

        return Promise.all([p1, p2]).then(() => {
          this.event.emit('ready', true);
          resolve();
        }).catch((err) => {
          reject();
        });
      });
    });
  }

  public startLoading() {
    this.loading += 1;
  }

  public stopLoading() {
    this.loading -= 1;
  }

  public getContent(url: string) {
    return new Promise((resolve, reject) => {
      this.startLoading();
      this.apiService.getContent(url)
        .finally(() => { this.stopLoading(); })
        .subscribe(
          data => { return resolve(data); },
          err => { return reject(err); }
        );
    });
  }

}
