import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { ProgramService } from './configure/programs';
import { Http } from '@angular/http';
import 'rxjs/add/observable/of';
import { DataSetService } from './shared';

@Injectable()
export class DataResolver implements Resolve<any> {
  	constructor(private programService: ProgramService){

  	}
  	//prog: ProgramService;

	public resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot):Observable<any>|Promise<any>| any {
	    return this.programService.getPrograms();
	    //return Observable.of('This is resolved');
	}
}

@Injectable()
export class SystemUidResolver implements Resolve<any> {
  	constructor(private programService: ProgramService){

  	}
	public resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot):Observable<any>|Promise<any>| any {
	    return this.programService.getSystemUids(7);
	    //return Observable.of('This is resolved');
	}
}
@Injectable()
export class DataStoreResolver implements Resolve<any> {
  	constructor(private programService: ProgramService){
        
    }public resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot):Observable<any>|Promise<any>| any {
	   
	    return Observable.of('This is resolved');
	}

}
@Injectable()
export class DataSetResolver implements Resolve<any> {
  	constructor(private dataSetService: DataSetService){
        
    }
    public resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot):Observable<any>|Promise<any>| any {
	   
	     return this.dataSetService.getDataSets();
	}

}
@Injectable()
export class OptionSetResolver implements Resolve<any> {
  	constructor(private dataSetService : DataSetService){

  	}
	public resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot):Observable<any>|Promise<any>| any {
	    return this.dataSetService.getOptionSets();
	    //return Observable.of('This is resolved');
	}
}
 
// an array of services to resolve routes with data
export const APP_RESOLVER_PROVIDERS = [
  DataResolver, SystemUidResolver, DataStoreResolver, DataSetResolver, OptionSetResolver
];
