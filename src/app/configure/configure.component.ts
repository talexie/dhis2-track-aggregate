import { Component, OnInit, DoCheck } from '@angular/core';
import { Http } from '@angular/http';
import { ActivatedRoute} from '@angular/router';
import { ReactiveFormsModule, FormGroup, FormControl,NgForm,NgModel, FormArray, FormBuilder,Validators } from '@angular/forms';
import { LocalDataSource } from 'ng2-smart-table';
import { 
  DynamicFormControlModel, 
  DynamicFormService,
    DynamicCheckboxModel,
    DynamicInputModel,
    DynamicFormArrayModel,
    DynamicDatepickerModel 
} from '@ng2-dynamic-forms/core';
import { isNull } from 'util';

import {  PROGRAM_LAST_FORM_MODEL,PROGRAM_FORM_MODEL,MESSAGE_FORM_MODEL,CONFIGURE_TYPE_FORM_MODEL} from '../configure/models';
import { DataSetService, NotifyService } from '../shared';

@Component({
    //moduleId: module.id,
	selector: 'configure',
	templateUrl: './configure.component.html',
	providers: [ NotifyService, DataSetService ]
})

export class ConfigureComponent implements OnInit,DoCheck{
  
                private configureTypeFormModel:Array<DynamicFormControlModel> = CONFIGURE_TYPE_FORM_MODEL;
                private configureTypeFormGroup: FormGroup = new FormGroup({}); 
                private messageFormModel:Array<DynamicFormControlModel> = MESSAGE_FORM_MODEL;
                private messageFormGroup:FormGroup = new FormGroup({}); 
                private programFormModel:Array<DynamicFormControlModel> = PROGRAM_FORM_MODEL; 
                private programLastFormModel:Array<DynamicFormControlModel> =  PROGRAM_FORM_MODEL; 
                private programModel:any = []; 
                private programLmisModel: any = []; 
                private programOptionSetModel: any = [];
                private programFormGroup: FormGroup = new FormGroup({}); 
                private prevProgramFormGroup: any = {}; 
                private settings = {
                    columns: {
                        id: {
                            title: "Name"
                        },
                        name: {
                            title: "Description"
                        }
                    },
                    noDataMessage: " No templates found"
                };
                existingTemplates: LocalDataSource = new LocalDataSource([]); 
                existingTemplateData:any = [];
                configureType:string = "messaging";
                datasets:any = []; 
                dataSetObject:any = []; 
                optionSet:any = [];
                optionSetObject:any = []; 
    /** Initialise the  Configure Component 
    **/

	constructor(
    private route: ActivatedRoute,
    private formService: DynamicFormService,
    private dataSetService: DataSetService 
       		){
       //route.data.subscribe(programs => { this.programData = programs });
       this.datasets = route.snapshot.data['datasets'], 
       this.optionSet = route.snapshot.data['optionSet'];
    }
	
	public ngOnInit() {
    this.configureTypeFormGroup = this.formService.createFormGroup(this.configureTypeFormModel), 
    this.existingTemplates.load(this.existingTemplateData), this.addMessagingSetting(), 
    this.addProgramSetting(); 
 	}
  getConfigureType(event) {
      if(this.configureTypeFormGroup.value.type = "messaging"){
        this.addMessagingSetting();
      } 
      else if(this.configureTypeFormGroup.value.type = "program"){
        this.addProgramSetting();
      }
      else{

      }
  } 
  addProgramSetting() {
                //__WEBPACK_IMPORTED_MODULE_4__models__.c;
      this.programModel = [], 
      this.programFormGroup = this.formService.createFormGroup([]), 
      this.programOptionSetModel = [], 
      this.programLmisModel = [], 
      this.dataSetObject = this.getObjectByAttribute(this.datasets.dataSets, "LMIS"), 
      this.programModel = this.dataSetService.createFormModelItem(PROGRAM_FORM_MODEL, this.dataSetObject, "select", "program", "Select Programs"); 
      this.programModel = this.dataSetService.createFormModelItem(this.programModel, this.optionSetObject, "select", "warehouse", "Select Warehouse OptionSet"); 
      this.programModel = this.dataSetService.createFormModelItem(this.programModel, [], "select", "lmisIndentifier", "Select LMIS Indentifier Attribute");
      this.programFormGroup = this.formService.createFormGroup(this.programModel);
  }
  addMessagingSetting() {
    this.messageFormGroup = new FormGroup({}), 
    this.messageFormGroup = this.formService.createFormGroup(this.messageFormModel);
  }
  getObjectByAttribute(objects, attribute) {
      return this.dataSetService.filterObjectByAttribute(objects, attribute);
  }
  updateProgramForm($event) {
      console.log("Event " + $event);
  }
  ngDoCheck() {
      if((this.programFormGroup.value.program === this.prevProgramFormGroup.program) || (isNull(this.programFormGroup.value.program))){
        
        this.programModel = this.dataSetService.updateFormModelItem(this.programModel, this.dataSetObject, "lmisIndentifier");
        this.programFormGroup = this.formService.createFormGroup(this.programModel);  
      }
      
      this.prevProgramFormGroup.program = this.programFormGroup.value.program;
  }

}