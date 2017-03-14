import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TreeModule } from 'angular2-tree-component';
import { HttpModule } from '@angular/http';
import {
  NgModule,
  ApplicationRef
} from '@angular/core';
import {
  removeNgStyles,
  createNewHosts,
  createInputTransfer
} from '@angularclass/hmr';
import {
  RouterModule,
  PreloadAllModules
} from '@angular/router';
import { MaterialModule,MdButton } from '@angular/material';
import 'hammerjs';
//import * as _ from 'lodash';

import { DynamicFormsCoreModule } from "@ng2-dynamic-forms/core";
import { DynamicFormsMaterialUIModule } from "@ng2-dynamic-forms/ui-material";

import { Ng2SmartTableModule } from 'ng2-smart-table';
import { MyDatePickerModule } from 'mydatepicker';
import { SimpleNotificationsModule,NotificationsService } from 'angular2-notifications';
import { DynamicComponentModule } from 'angular2-dynamic-component';

/** D2 Library **/

import log from 'loglevel';

import {FlexLayoutModule} from "@angular/flex-layout";
/*
 * Platform and Environment providers/directives/pipes
 */
import { ENV_PROVIDERS } from './environment';
import { ROUTES } from './app.routes';
// App is our top level component
import { AppComponent } from './app.component';
import { APP_RESOLVER_PROVIDERS } from './app.resolver';
import { AppState, InternalStateType } from './app.service';
import { HomeComponent } from './home';
import { AboutComponent } from './about';
import { ConfigureComponent } from './configure';
import { NoContentComponent } from './no-content';
import { XLargeDirective } from './home/x-large';
import { Logger } from './logger.service';
import { TrackerFormComponent } from './configure/services';
import { DataResolver, DataSetResolver,DataStoreResolver,OptionSetResolver } from './app.resolver';
import { ProgramService } from './configure/programs';
import { Constants, NotifyService, OrgUnitService, DataSetService, DataStoreService } from './shared';

import '../styles/styles.scss';
import '../styles/headings.css';

// Application wide providers

const APP_PROVIDERS = [
  ...APP_RESOLVER_PROVIDERS,
  AppState, Logger, ProgramService, Constants,DataSetService, NotifyService, NotificationsService
];

type StoreType = {
  state: InternalStateType,
  restoreInputValues: () => void,
  disposeOldHosts: () => void
};

/**
 * `AppModule` is the main entry point into Angular2's bootstraping process
 */
@NgModule({
  bootstrap: [ AppComponent ],
  declarations: [
    AppComponent,
    AboutComponent,
    HomeComponent,
    ConfigureComponent,
    TrackerFormComponent,
    NoContentComponent,
    XLargeDirective
  ],
  imports: [ // import Angular's modules
    BrowserModule,
    FormsModule,
    HttpModule,
    DynamicFormsCoreModule.forRoot(), 
    DynamicFormsMaterialUIModule, 
    ReactiveFormsModule,
    RouterModule.forRoot(ROUTES, { useHash: true, preloadingStrategy: PreloadAllModules }),
    MaterialModule,
    Ng2SmartTableModule,
    FlexLayoutModule.forRoot(),
    CommonModule,
    TreeModule,
    DynamicComponentModule,
    SimpleNotificationsModule,
    MyDatePickerModule
  ],
  providers: [ // expose our Services and Providers into Angular's dependency injection
    ENV_PROVIDERS,
    APP_PROVIDERS
  ]
})
export class AppModule {

  constructor(
    public appRef: ApplicationRef,
    public appState: AppState
  ) {}

  public hmrOnInit(store: StoreType) {
    if (!store || !store.state) {
      return;
    }
    console.log('HMR store', JSON.stringify(store, null, 2));
    // set state
    this.appState._state = store.state;
    // set input values
    if ('restoreInputValues' in store) {
      let restoreInputValues = store.restoreInputValues;
      setTimeout(restoreInputValues);
    }

    this.appRef.tick();
    delete store.state;
    delete store.restoreInputValues;
  }

  public hmrOnDestroy(store: StoreType) {
    const cmpLocation = this.appRef.components.map((cmp) => cmp.location.nativeElement);
    // save state
    const state = this.appState._state;
    store.state = state;
    // recreate root elements
    store.disposeOldHosts = createNewHosts(cmpLocation);
    // save input values
    store.restoreInputValues  = createInputTransfer();
    // remove styles
    removeNgStyles();
  }

  public hmrAfterDestroy(store: StoreType) {
    // display new elements
    store.disposeOldHosts();
    delete store.disposeOldHosts;
  }
  
}
