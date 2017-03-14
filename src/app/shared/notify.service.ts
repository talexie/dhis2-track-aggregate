import { Injectable } from '@angular/core';
import { Http, Response } from "@angular/http";
import { Observable, Subscription } from "rxjs";
import { NotificationsService, SimpleNotificationsComponent } from 'angular2-notifications';
import 'rxjs/add/observable/throw';
/**
 * Created by Alex Tumwesigye, Feb 2017.
 */
@Injectable()
export class NotifyService {
    /** Notifications **/
    public options = {
        timeOut: 5000,
        lastOnBottom: true,
        clickToClose: true,
        maxLength: 0,
        maxStack: 7,
        showProgressBar: true,
        pauseOnHover: true,
        preventDuplicates: false,
        preventLastDuplicates: 'visible',
        rtl: false,
        animate: 'scale',
        position: ['right', 'top']
    };
    constructor(
      private notify: NotificationsService 
      ){
      
    }

    success(title:string, message:string){
      return this.notify.success(title,message);
    }
    alert(title:string, message:string){
      return this.notify.alert(title,message);
    }
    error(title:string, message:string){
      return this.notify.error(title,message);
    }
    info(title:string, message:string){
      return this.notify.info(title,message);
    }
    create(title:string, message:string,type:string){
      return this.notify.create(title,message,type);
    }
    // General Http Handling error
    handleError (error: any) {
      return Observable.throw( error );
    }

}