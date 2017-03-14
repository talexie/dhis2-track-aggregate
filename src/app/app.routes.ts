import { Routes } from '@angular/router';
import { HomeComponent } from './home';
import { ConfigureComponent} from './configure';
import { TrackerFormComponent } from './configure/services';
import { AboutComponent } from './about';
import { NoContentComponent } from './no-content';

import { DataResolver, SystemUidResolver,DataSetResolver,OptionSetResolver } from './app.resolver';

export const ROUTES: Routes = [
  { path: '', component: TrackerFormComponent,
    resolve: {
          programs: DataResolver,
          uids: SystemUidResolver,
          datasets: DataSetResolver,
          optionSet: OptionSetResolver
      }
  }, 
  {
    path: "configure",
    component: ConfigureComponent,
    resolve: {
        datasets: DataSetResolver,
        optionSet: OptionSetResolver
    }
  },
  //{ path: 'home',  component: HomeComponent },
  /*{ 
  	path: 'configure', 
  	component: ConfigureComponent,
  	resolve: {
  		programs: DataResolver
  	} 
  },*/
  //{ path: 'about', component: AboutComponent },
  //{ path: 'detail', loadChildren: './+detail#DetailModule'},
  //{ path: 'barrel', loadChildren: './+barrel#BarrelModule'},
  { path: '**',    component: NoContentComponent },
];
