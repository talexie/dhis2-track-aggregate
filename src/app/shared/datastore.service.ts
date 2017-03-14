import { Injectable } from '@angular/core';
import { Http, Response,URLSearchParams, Headers, RequestOptions } from "@angular/http";
import { Observable, Subscription } from "rxjs";
import { isUndefined,isNull,isArray} from 'util';

import { NotifyService, Constants } from '../shared';
/**
 * Created by Alex Tumwesigye, Feb 2017.
 */
@Injectable()
export class DataStoreService {
    private DHIS2URL: string;

    constructor(
      private notify: NotifyService,
      private constant: Constants,
      private http: Http 
      ){
    	this.DHIS2URL = this.constant.ROOTURL;  // URL to web API
    }

    /** 
    Get dataStore by search key 
    **/
    getDataStoreByKey(dataStore,dataStoreKey){
	    if((!isUndefined(dataStore)) && (!isUndefined(dataStoreKey))){
		    return this.http.get(this.DHIS2URL + 'api/dataStore/' + dataStore + '/' + dataStoreKey + '.json?paging=false')
		      .map((res:Response) => res.json())
		      .catch(this.notify.handleError);
		}
	} 
	 /** 
	 Get dataStore 
	 **/
    getDataStore(dataStore){
	    if(!isUndefined(dataStore)){
		    return this.http.get(this.DHIS2URL + 'api/dataStore/' + dataStore + '.json?paging=false')
		      .map((res:Response) => res.json())
		      .catch(this.notify.handleError);
		}
	}
	/** 
	 save key to dataStore 
	 **/ 
	postDataStore(dataStore,dataStoreKey,dataStoreValues) {
	    let headers = new Headers({ 'Content-Type': 'application/json' });
	    let options = new RequestOptions({ headers: headers });
	    return this.http.post(this.DHIS2URL + 'api/dataStore/' + dataStore + '/' + dataStoreKey, dataStoreValues, headers)
	    .map((res: Response) => res.json())
	    .catch(this.notify.handleError);
	}

	/** 
	 Update key to dataStore 
	 **/ 
	updateDataStore(dataStore,dataStoreKey,dataStoreValues) {
	    let headers = new Headers({ 'Content-Type': 'application/json' });
	    let options = new RequestOptions({ headers: headers });
	    return this.http.put(this.DHIS2URL + 'api/dataStore/' + dataStore + '/' + dataStoreKey, dataStoreValues, headers)
	    .map((res: Response) => res.json())
	    .catch(this.notify.handleError);
	}
	/** 
	 Delete key to dataStore 
	 **/ 
	deleteDataStoreKey(dataStore,dataStoreKey) {
	    return this.http.delete(this.DHIS2URL + 'api/dataStore/' + dataStore + '/' + dataStoreKey)
	    .catch(this.notify.handleError);
	}
	/** Get DataStore by NameSpace 
	**/
	getDataStoreNameSpace(dataStores,namespace){

	}

}