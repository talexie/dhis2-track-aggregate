import { Component, OnInit, ViewEncapsulation,ValueProvider,ViewChild } from '@angular/core';
import { FormGroup, FormControl,NgForm,NgModel, FormArray, FormBuilder,Validators, FormsModule,ReactiveFormsModule } from '@angular/forms';
import { TRACKER_FORM_MODEL } from '../models/trackerentry.model';
import { 
	DynamicFormControlModel, 
	DynamicFormService,
    DynamicCheckboxModel,
    DynamicInputModel,
    DynamicFormArrayModel,
    DynamicDatepickerModel,
    DynamicSelectModel 
} from '@ng2-dynamic-forms/core';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs/Observable';

import { ProgramService } from '../programs';
import { LocalDataSource } from 'ng2-smart-table';
import { Logger } from '../../logger.service';
import { Subscription } from 'rxjs';
import { Constants } from '../../shared/constants';
import { OrgUnitService, DataSetService, NotifyService, TextField,CheckboxField,RadioField,DYNAMIC_MODULE } from '../../shared';
import { TreeNode, TREE_ACTIONS, IActionMapping, TreeComponent } from 'angular2-tree-component';
import { Angular2Csv } from "angular2-csv";
import { forEach } from '@angular/router/src/utils/collection';
import { isUndefined,isNullOrUndefined } from 'util';
import { initDomAdapter } from '@angular/platform-browser/src/browser';
import { IMyOptions, IMyDateModel, IMyDate } from 'mydatepicker';
import { MdSelect,MdSelectModule,MdIcon,MdIconRegistry,MdButton, MaterialModule,MdInputContainer } from '@angular/material';
import { DynamicComponent } from 'angular2-dynamic-component/index';
import { DynamicFormsCoreModule } from "@ng2-dynamic-forms/core";
import { DynamicFormsMaterialUIModule } from "@ng2-dynamic-forms/ui-material";
import * as moment from 'moment';

const actionMapping:IActionMapping = {
  mouse: {
    click: (node, tree, $event) => {
      $event.shiftKey
        ? TREE_ACTIONS.TOGGLE_SELECTED_MULTI(node, tree, $event)
        : TREE_ACTIONS.TOGGLE_SELECTED(node, tree, $event)
    }
  }
};

const WINDOW_PROVIDER: ValueProvider = {
  provide: Window,
  useValue: window
};

@Component({
    selector: 'tracker-dynamic-form',
    styleUrls: ['../../../../node_modules/@angular/material/core/theming/prebuilt/indigo-pink.css'],
    templateUrl: './trackerform.component.html',
    encapsulation: ViewEncapsulation.None,
    providers: [ ProgramService, Logger,OrgUnitService, NotifyService, DataSetService ]
})
export class TrackerFormComponent implements OnInit {
    /** Dynamic form creation **/

    formModel: Array<DynamicFormControlModel> = TRACKER_FORM_MODEL;
    private trackerEntryFormGroup: FormGroup = new FormGroup({});
    entityForm: FormGroup = new FormGroup({});
    entityAttributeForm: FormGroup = new FormGroup({});
    private programIdentifierControl: FormControl = new FormControl({ value:'',disabled:false }, Validators.required);
    private cyclesControl: FormControl = new FormControl({ value:'Select Cycle',disabled:false }, Validators.required);
    private programWarehouseControl: FormControl = new FormControl({ value:'',disabled:false }, Validators.required);
    private programDeliveryControl: FormControl = new FormControl({ value:'',disabled:false }, Validators.required);
    private programOrderTypeControl: FormControl = new FormControl({ value:'Select Type of Order',disabled:false }, Validators.required);


    checkboxControl: FormControl;
    checkboxModel: DynamicCheckboxModel;

    arrayControl: FormArray;
    arrayModel: DynamicFormArrayModel;

    private _programsMetaData: any = [];
    private idnames = [];
    private dataElements: any = [];
    private program: any = {};
    private programStage: any = [];
    private programAttributes: any = [];
    private trackerFields:Array<DynamicFormControlModel>  = [];
    programData: any;
    source: LocalDataSource;
    trackerFieldsLength: number = 0;


    private subscription: Subscription;
    orgUnit: any = {};
    orgunits: any[] = [];
    loading: boolean = true;
    treeOrgunits: any[] = [];
    orgunitLevels: any = 1;
    DHIS2URL: string;
    orgunitTreeConfig: any = {
        showSearch : true,
        searchText : 'Search',
        level: null,
        loading: false,
        loadingMessage: 'Loading Organisation units...',
        multiple: true,
        placeholder: "Select Organisation Unit"
    };
    organisationunits: any[] = [];
    selectedOrgUnits: any[] = [];
    defaultOrgUnit: string[] = [];
    showOrgTree:boolean = true;
    showAdditionalOptions:boolean = true;

    showDetails:boolean = false;

    @ViewChild('orgtree')
    orgtree: TreeComponent;

    orgUnitLength:number = 0;
    orgunitForModel:any = [];
    metadataReady = false;
    haveAuthorities:boolean = false;

    stageDataElementsLoaded: boolean = false;
    stageFormSubmitted: boolean = false;
    trackedEntitySubmitted: boolean = false;
    private stageFormOpen: boolean = false;
    /** Set settings for table layout
     **/
    settings = {
       /* columns: {
          id: {
            title: 'ID'
          },
          name: {
            title: 'Name'
          }
        },
        noDataMessage: ' No data found' */
      };
    tableListData: any = [];
    listData: any = [];
    eventsData: any = [];
    // custom settings for tree
    customTemplateStringOptions: any = {
        isExpandedField: 'expanded',
        actionMapping
    };
    // Program Tree
    private programsTree:  any[] = [];
    private selectedProgram: any[] = [];
    private programTreeObject: any = {};
    private orgUnitPrograms: any = [];
    private uids:any = [];
    private noProgramDataMessage: string = '';
    private programAssigned: boolean = false;
    private programActivated: boolean = false;
    private cyclesEnabled = true;
    private cycles:  any = [];
    private orderTypes:  any = [];
    private programUniqueIdentifier: any = {};
    private programCycleIdentifier: any = {};
    private payload: any = [];
    private orgUnitAncestors: any = [];
    private orgUnitGroups: any = [];
    private generatedValue: any;
    private orderAvailable: boolean = false;
    private periodId: string;
    private periodName: string;
    //Date handlers
    private trackerDatePickerOptions: IMyOptions = {
        // other options...
      dateFormat: 'yyyy-mm-dd',
      firstDayOfWeek: '-mo',
      sunHighlight: true,
      height: '30px',
      width: '200px',
      inline: false,
      markCurrentDay: true,
    };
    private trackerDatePickerOptionsDisabled: IMyOptions = {
        // other options...
      dateFormat: 'yyyy-mm-dd',
      firstDayOfWeek: '-mo',
      sunHighlight: true,
      height: '30px',
      width: '200px',
      inline: false,
      markCurrentDay: true,
      editableDateField: false,
      showClearDateBtn: false,
      componentDisabled: true,
    };
    private selDate: IMyDate = { year: 0, month: 0, day: 0};
    public notifyOptions = {};

    // Dynamic form for DataSets
      extraTemplate = "<span>Dynamic inside dynamic!</span>";
      extraModules = [ FormsModule,ReactiveFormsModule, MaterialModule ];
      private dataSetElements: any = [];
      private dynamicColumns: any =[];
      entityDataEntryForm: FormGroup = new FormGroup({});
      dataSetForm: FormGroup = new FormGroup({});
      dataSets: any = [];
      dataSetsEnabled: any = [];
      private lmisOptionSets: any;
      private selectedDueDate: any;
      private programDeliveryZoneAttr: any;
      private programWarehouseAttr: any;
      private programOrderTypeAttr: any;
      private zone:any;
      private warehouse: any;
      private enabledDataSets: any = [];
      private dataEntryControl: FormArray;
      private dataEntryFormLoaded: boolean = false;
      private dataSetLoaded: string = "";
      private categoryCombos: any = [];
      private isReadOnly: boolean = false;
      private isHidden: boolean = false;
      private prevSelectedDataSetId: any = "";
      private uniqueNumberGenerated: boolean = false;
      private dataElementToUpdate:any = {};
      private currentDataElementToUpdate:any = {};
      private optionsSearched:any = [];
      private stageDataElements: any = [];
      private programStageDataElements: any = [];

    // Controls
    //private programIdentifierControl: FormControl = new FormControl('', Validators.required);
    constructor(
    	
    	private prog: ProgramService,
    	private logger: Logger,
    	private formService: DynamicFormService,
      private route: ActivatedRoute,
      private constant: Constants,
      private orgunitService: OrgUnitService,
      private formBuilder: FormBuilder,
      private notify: NotifyService,
      private dataSetService: DataSetService,

      ){
    	  route.data.subscribe(programs => { 
          this.programData = programs 
        });
        //route.data.subscribe(uids => { this.uids = uids });
        this.uids = route.snapshot.data['uids'];
        this.DHIS2URL = this.constant.ROOTURL;
        /** Notifications **/
        this.notifyOptions = this.notify.options;
        this.dataSets = route.snapshot.data['datasets'];
        this.lmisOptionSets = route.snapshot.data['optionSet'];
        

    }

    ngOnInit() {

    	this.source = new LocalDataSource();
    	this._programsMetaData = this.programData.programs.programs;
      this.dataSetsEnabled = this.dataSets.dataSets;
    	this.trackerEntryFormGroup = this.formService.createFormGroup(this.formModel);
      

      this.entityDataEntryForm = this.formBuilder.group({
        dataElements: new FormArray([])
      });
      this.dataSetForm = this.formBuilder.group({
        selectedOrgUnitId: new FormControl(''),
        selectedDataSetId: new FormControl(''),
        selectedPeriodId: new FormControl(''),
      });

    	this.source.load(this.tableListData);
      this.stageFormSubmitted = false;
      this.stageDataElementsLoaded = false;
      this.stageFormOpen = false; 

        //loading organisation units
 
        this.orgunitTreeConfig.loading = true;
        if (this.orgunitService.nodes == null) {
          this.orgunitService.getOrgunitLevelsInformation()
            .subscribe(
              (data: any) => {
                this.orgunitService.getUserInformation().subscribe(
                  userOrgunit => {
                    let level = this.orgunitService.getUserHighestOrgUnitlevel(userOrgunit);
                    let allLevels = data.pager.total;
                    let orgunits = this.orgunitService.getuserOrganisationUnitsWithHighestlevel(level,userOrgunit);
                    let useLevel = parseInt(allLevels) - (parseInt(level) - 1);

                    //load inital orgiunits to speed up loading speed
                    this.orgunitService.getInitialOrgunitsForTree(orgunits).subscribe(
                      (initialData) => {
                        //noinspection TypeScriptUnresolvedVariable
                        this.orgUnit = {
                          id: initialData.organisationUnits[0].id,
                          name: initialData.organisationUnits[0].name,
                          children: initialData.organisationUnits[0].children
                        };
                        this.orgUnitLength = this.orgUnit.children.length+1;
                        this.metadataReady = true;
                        //noinspection TypeScriptUnresolvedVariable
                        this.organisationunits = initialData.organisationUnits;
                        this.activateNode(this.orgUnit.id, this.orgtree);
                        this.orgunitTreeConfig.loading = false;
                        // after done loading initial organisation units now load all organisation units
                        let fields = this.orgunitService.generateUrlBasedOnLevels(useLevel);
                        this.orgunitService.getAllOrgunitsForTree1(fields, orgunits).subscribe(
                          items => {
                            //noinspection TypeScriptUnresolvedVariable
                            this.organisationunits = items.organisationUnits;
                            //noinspection TypeScriptUnresolvedVariable
                            this.orgunitService.nodes = items.organisationUnits;
                            this.prepareOrganisationUnitTree(this.organisationunits, 'parent');
                          },
                          error => {
                            this.notify.error('OrgUnit','something went wrong while fetching Organisation units');
                            this.orgunitTreeConfig.loading = false;
                          }
                        )
                      },
                      error => {
                        this.notify.error('OrgUnit','something went wrong while fetching Organisation units');
                        this.orgunitTreeConfig.loading = false;
                      }
                    )

                  }
                )
              }
            );
        }
        else {
          this.orgunitTreeConfig.loading = false;
          //console.log(this.orgunitService.nodes)
          this.defaultOrgUnit = [this.orgunitService.nodes[0].id];
          this.orgUnit = {
            id: this.orgunitService.nodes[0].id,
            name: this.orgunitService.nodes[0].name,
            children: this.orgunitService.nodes[0].children
          };
          this.orgUnitLength = this.orgUnit.children.length+1;
          this.organisationunits = this.orgunitService.nodes;
          this.activateNode(this.orgUnit.id, this.orgtree);
          this.prepareOrganisationUnitTree(this.organisationunits, 'parent');
          // TODO: make a sort level information dynamic
          this.metadataReady = true;
          // Load the forms;
        }

      this.dataSetForm.valueChanges.subscribe(changedValue => {

        
        if(this.prevSelectedDataSetId !== changedValue.selectedDataSetId){
          this.dataEntryFormLoaded = true;
          this.getDataSet(changedValue.selectedDataSetId);
          this.prevSelectedDataSetId = changedValue.selectedDataSetId;
        }
        
      });
      this.entityAttributeForm.valueChanges.subscribe(changedAttribute => {
        if(!isUndefined(this.programOrderTypeAttr)){
          setTimeout(() => {
            if((changedAttribute[this.programOrderTypeAttr.trackedEntityAttribute.id]) !== 
              "Select Type of Order"){
              this.programActivated = true;
              this.stageDataElements = this.getStageElements(this.programData.programs.programs,this.programTreeObject);
        
              let nOptionSets = this.dataSetService.getNOptionSetsFromDataElements(this.stageDataElements);
       
              this.dataSetService.getNOptionSet(nOptionSets).subscribe((optionSets) => { 
                let optionSet = this.dataSetService.getSearchOptionSet(optionSets.optionSets,changedAttribute[this.programOrderTypeAttr.trackedEntityAttribute.id]);
               
                if(!isUndefined(optionSet)){
                  this.dataElementToUpdate = this.dataSetService.getDataElementWithOptionSet(this.stageDataElements,optionSet.id);
               
                  this.optionsSearched = this.dataSetService.getOptionsByAttribute(optionSet,changedAttribute[this.programOrderTypeAttr.trackedEntityAttribute.id]);
               
                  setTimeout(() => {
                    if(!isNullOrUndefined(this.optionsSearched)){

                     this.updateModel(this.formModel,this.dataElementToUpdate.id,this.formService,this.optionsSearched);
                    }
                  },0);
                   
                }
                else{
                  this.notify.error("", "An error occurred while getting the formualations types");
                  this.optionsSearched = [{}];
                  this.updateModel(this.formModel,this.dataElementToUpdate.id,this.formService,this.optionsSearched);
                  if(!isNullOrUndefined(this.dataElementToUpdate.id)){
                    this.trackerEntryFormGroup.get(this.dataElementToUpdate.id).reset();
                    this.trackerEntryFormGroup.get(this.dataElementToUpdate.id).invalid;
                  }
                }
              });
  
            }
            else{
              this.programActivated = false;
            }
          },0);
        }

      });    
          
    }
    //ngAfterViewInit(){
     //   this.activateNode(this.period.id, this.pertree);
    //}

    prepareOrganisationUnitTree(organisationUnit,type:string='top') {
        if (type == "top"){
          if (organisationUnit.children) {
            organisationUnit.children.sort((a, b) => {
              if (a.name > b.name) {
                return 1;
              }
              if (a.name < b.name) {
                return -1;
              }
              // a must be equal to b
              return 0;
            });
            organisationUnit.children.forEach((child) => {
              this.prepareOrganisationUnitTree(child,'top');
            })
          }
        }
        else{
            //console.log("Org Units",organisationUnit)
            organisationUnit.forEach((orgunit) => {
            //console.log(orgunit);
            if (orgunit.children) {
              orgunit.children.sort((a, b) => {
                if (a.name > b.name) {
                  return 1;
                }
                if (a.name < b.name) {
                  return -1;
                }
                // a must be equal to b
                return 0;
              });
              orgunit.children.forEach((child) => {
                this.prepareOrganisationUnitTree(child,'top');
              })
            }
          });
        }
    }
    addToOrder(){
        this.stageFormSubmitted = false;
        this.stageFormOpen = true;
        this.stageDataElementsLoaded = false;

        this.trackerFields = this.getStageTrackerFields(this.programData.programs.programs,this.programTreeObject);
        
        if(this.trackerFields.length > 0){
          this.formModel = []; 
	        this.trackerEntryFormGroup = this.formService.createFormGroup(this.prog.createProgramStageFormModel(this.formModel, this.trackerFields, this.stageDataElementsLoaded));
          setTimeout(() => {
            if(!isNullOrUndefined(this.optionsSearched)){

             this.updateModel(this.formModel,this.dataElementToUpdate.id,this.formService,this.optionsSearched);
            }
          },0);
          this.stageDataElementsLoaded = true;          
        }
          
    }
    /**
    update data element stage Model 
    **/
    updateModel(formModel,id,formService,options){
      if((!isUndefined(options)) && (!isUndefined(options))){
        return this.prog.updateSelectModel(formModel,id,formService,options);
      }
      else{
        this.notify.error("","There are no options available to choose from");
      }
    }
    /** Get dataSets for reporting
    **/
    getDataSets(){
      this.enabledDataSets = this.dataSetService.getDataSetByAttribute(this.dataSets.dataSets,'LMIS');
    }
    /**
    Load data entry form based on the choosen dataSet.
    **/
    getDataSet(dataSet){
      console.log("dataSetcc " + !isUndefined(dataSet) + " Loaded " + this.dataEntryFormLoaded);
      
      if(!isUndefined(dataSet)){
        return this.dataSetService.getDataSet(dataSet).subscribe((dataSetObject) => {

          this.dataSetService.getDataElementsByDataSet(dataSet).subscribe((dataElement) => {
            this.categoryCombos = [];
            let filteredDataElements: any = [];

            filteredDataElements = this.dataSetService.groupDataElementOptionCombosByName(dataElement.dataElements,this.dataSetService.filterCategoriesByItem(dataElement.dataElements));
            console.log("dataSetcato " + JSON.stringify(filteredDataElements));
            if(!isUndefined(filteredDataElements)){
              this.entityDataEntryForm.get('dataElements').setValue([]);
              this.dataSetService.getCategoryCombos('DISAGGREGATION').subscribe((categoryCombo)=>{
                
                this.categoryCombos = this.dataSetService.createCategoryComboFormArray(categoryCombo.categoryCombos,filteredDataElements);
                console.log("dataSetx " + JSON.stringify(dataSet) + " Loaded " + this.dataEntryFormLoaded);

                this.buildTestForm(this.categoryCombos);
                this.dataSetLoaded = dataSet; 
               
              });            
            }
            else{
              this.notify.error("","The data elements are missing ");
            }
          });
        });
      }
      else{
        console.log('Im using old form');
        this.buildTestForm(this.categoryCombos);
      }     
    }
    buildTestForm(elements){
      this.dataSetElements = elements;
      this.dataEntryControl = <FormArray> this.entityDataEntryForm.get('dataElements');
      for(let categoryCombo of elements){     
        this.dataEntryControl.push(this.createCategoryComboFormGroup(categoryCombo));
      }        
      return this.dataEntryControl;
    }
    createCategoryComboFormGroup(categoryCombos:any){
      return this.createDataElementFormGroup(categoryCombos.dataElements);
    }
    createDataElementFormGroup(dataElements:any){
      let dataElementFormGroup: any = {};
      for(let dataElement of dataElements){
        dataElementFormGroup[dataElement.id] = this.createDataElementOptionComboFormGroup(dataElement.optionCombos);
      }
      return this.formBuilder.group(dataElementFormGroup);
    }

    createDataElementOptionComboFormGroup(optionCombos:any){
      let optionComboFormGroup: any = {};
      for(let optionCombo of optionCombos){
        optionComboFormGroup[optionCombo.id] = this.createDataElementOptionFormGroup(optionCombo.options);
      }
      return this.formBuilder.group(optionComboFormGroup);
    }

    createDataElementOptionFormGroup(options:any) {
          let t:any = {};
          for (let option of options){
           t[option.id] = [''];  
          }
          return this.formBuilder.group(t);
         
      }
    proceed(){
      this.stageFormOpen = false;
      this.listData = [];
      this.listData = this.tableListData;
      this.eventsData = this.prog.createEvents(this.listData,this.selectedProgram);
      this.payload = this.prog.createWebApiPayload(this.uids,this.eventsData,this.entityAttributeForm.value,this.selectedProgram,this.orgUnit.id)
      this.prog.submitTrackedEntityAndEvent(this.payload);
      let message = "Your Order #" + this.entityAttributeForm.value[this.programUniqueIdentifier.trackedEntityAttribute.id] + " has been submitted successfully, please proceed to submit your report."
      this.notify.success("", message);
      this.trackedEntitySubmitted = true;

      this.periodId = moment(moment(this.entityAttributeForm.value.dueDate.formatted,'YYYY-MM-DD').subtract(1,'M')).format('YYYYMM');
     console.log("Due Date" + JSON.stringify(this.entityAttributeForm.value["dueDate"]) + " " + this.periodId);
      this.periodName = moment(moment(this.entityAttributeForm.value.dueDate.formatted,'YYYY-MM-DD').subtract(1,'M')).format('MMMM YYYY');
      this.dataSetForm.get('selectedOrgUnitId').setValue(this.orgUnit.id);
      this.dataSetForm.get('selectedPeriodId').setValue(this.periodId);
      this.getDataSets();

    }
    add(event) {
        this.stageDataElementsLoaded = false;
        this.stageFormOpen = false;
        this.stageFormSubmitted = true;
        this.tableListData.push(this.trackerEntryFormGroup.value);
        this.source.load(this.tableListData);
       
    }

    remove(index: number) {
        this.formService.removeFormArrayGroup(index, this.arrayControl, this.arrayModel);
    }

    onChange($event) {
        /**
        Test changes on dropdowns

        **/       

      if((!isNullOrUndefined(this.dataElementToUpdate.id)) && (this.dataElementToUpdate.id !== '')){

        let changedValue = this.trackerEntryFormGroup.get(this.dataElementToUpdate.id
          ).value;

        this.getDataElementSelectedOptions(changedValue,this.stageDataElements); 
        if(!isNullOrUndefined(this.currentDataElementToUpdate.id)){
          this.trackerEntryFormGroup.get(this.currentDataElementToUpdate.id).valueChanges.subscribe((optionValue)=> {
            this.dataSetService.getOptionByCode(optionValue).subscribe((options) => {
              let basicUnitOptions: any = [];
              let optionAttributeCode = this.dataSetService.getOptionAttributeValueByCode(options.options,'LMIS_ATTR_BASIC_UNIT');
            
              if(!isUndefined(optionAttributeCode)){
                let dataElementBasicUnit = this.dataSetService.getDataElementByAttribute(this.programStageDataElements,'LMIS_ATTR_BASIC_UNIT_DATA_ELEMENT');
                basicUnitOptions.push({label: optionAttributeCode, value: optionAttributeCode});
                this.updateModel(this.formModel,dataElementBasicUnit.dataElement.id,this.formService,basicUnitOptions);
                this.trackerEntryFormGroup.get(dataElementBasicUnit.dataElement.id).setValue(optionAttributeCode);
                
              }
              else{
                this.notify.info("", "There is no basic unit assigned");
              }               
            });
          });
        }       
      }
     
      /**
      Run program rules
      **/
        this.prog.getProgramRuleVariables(this.programTreeObject.program.id).subscribe((programRuleVariables) => {
          
          this.prog.getProgramRules(this.programTreeObject.program.id).subscribe((programRules) => {
            
            let actions:any = this.prog.applyProgramRules(programRules.programRules,programRuleVariables.programRuleVariables,'');
            this.runProgramRules(actions,this.trackerEntryFormGroup.value);
          });
        });
        
    }
    // add item to array of selected items when item is selected
    activateOrg = ($event) => {
        this.selectedOrgUnits = [$event.node.data];
        this.orgUnit = $event.node.data;
        // Get programs by orgUnit
        this.prog.getProgramsByOrgUnit(this.orgUnit.id).subscribe((orgUnitPrograms) =>{
          this.orgUnitPrograms = orgUnitPrograms.programs;
          this.orgUnitAncestors = orgUnitPrograms.ancestors;
          this.orgUnitGroups = orgUnitPrograms.organisationUnitGroups;
           // Load programs;
          if(isUndefined(orgUnitPrograms) || isUndefined(orgUnitPrograms.programs) || (orgUnitPrograms.programs.length < 1)){
            this.programsTree = [];
            this.programAssigned = false;
            this.noProgramDataMessage = "No programs available"
            this.notify.info("Program", this.noProgramDataMessage);
          }
          else{
            this.programAssigned = true;
            this.programsTree = this.createProgramTree(this.orgUnitPrograms);
            
          }
        },
        error => {
          //this.logger.log(" There was an error is generating the tree " + error);
          this.notify.info("Program", "There was an error is generating the tree");
        });       

    };


    activateNode(nodeId:any, nodes){
        setTimeout(() => {
          let node = nodes.treeModel.getNodeById(nodeId);
          if (node)
            node.toggleActivated();
        }, 0);
    }

    // function that is used to filter nodes
    filterNodes(text, tree) {
        tree.treeModel.filterNodes(text, true);
    }
 
    // display Orgunit Tree
    displayOrgTree(){
        this.showOrgTree = !this.showOrgTree;
    }

    // action to be called when a tree item is deselected(Remove item in array of selected items
    deactivateOrg ( $event ) {
    // this.card_selected_orgunits.forEach((item,index) => {
    //   if( $event.node.data.id == item.id ) {
    //     this.card_selected_orgunits.splice(index, 1);
    //   }
    // });
    }
    createTableHeader(metadata,programStage){
        let program: any = [];
        let programStageObject: any = [];
        let settings = {};
        // Check if program has children and reject it. **/

        program = this.prog.getProgram(metadata,programStage.program.id);
        programStageObject = this.prog.getProgramStage(program,programStage.id);        
        settings = this.prog.createStageTableHeadings(programStageObject);
        return settings;
    }
    /** Get program attributes **/
    getProgramAttributes(metadata, programStage){
        let attributes: any = {};
        // Check if program has children and reject it. **/
        if(!isUndefined(programStage.program)){
          attributes = this.prog.getProgram(metadata,programStage.program.id);
          return attributes.programTrackedEntityAttributes;
        }
        else{
          this.notify.error("","Select the Program Stage             ");
        }
    }
    getStageTrackerFields(metadata,programStage){
        let trackerProgram: any = [];
        let trackerProgramStage: any = [];
        let trackerProgramStageFields: any = [];     
        trackerProgram = this.prog.getProgram(metadata,programStage.program.id);
        trackerProgramStage = this.prog.getProgramStage(trackerProgram,programStage.id);
        trackerProgramStageFields = this.prog.getProgramStageDataElements(trackerProgramStage,programStage.id);
        return trackerProgramStageFields;
    }
    getStageElements(metadata,programStage){
      console.log("Reached here");
        let trackerProgram: any = [];
        let trackerProgramStage: any = [];
        let trackerProgramStageFields: any = [];     
        trackerProgram = this.prog.getProgram(metadata,programStage.program.id);
        trackerProgramStage = this.prog.getProgramStage(trackerProgram,programStage.id);
        trackerProgramStageFields = this.prog.getProgramStageDataElementsNoModel(trackerProgramStage,programStage.id);
        return trackerProgramStageFields;
    }
    createProgramTree(metadata){
   
        let programTreeNodes: any = [];

        Observable.from(metadata).subscribe((programNode: any) => {
          let programNodes: any = {};
          programNodes.id = programNode.id;
          programNodes.name = programNode.name;
          if(!isUndefined(programNode.programStages)){
            programNodes.children = [];
            Observable.from(programNode.programStages).subscribe((programStageNode: any) => {
              let programStageNodes: any = {};              
              programStageNodes.id = programStageNode.id;
              programStageNodes.name = programStageNode.name;
              programStageNodes.program = programStageNode.program;
              programNodes.children.push(programStageNodes);
            }); 
          }
          programTreeNodes.push(programNodes);

        });
        return programTreeNodes;
    }
    activateProgram = ($event) => {
        this.programActivated = true;
        this.selectedProgram = [$event.node.data];
        this.programTreeObject = $event.node.data;
        this.programAttributes = this.getProgramAttributes(this._programsMetaData,this.programTreeObject);
        this.settings = this.createTableHeader(this._programsMetaData,this.programTreeObject);
        let incidentDate: FormControl = new FormControl('incidentDate', Validators.required);
        this.entityAttributeForm.addControl('incidentDate', incidentDate);
        let dueDate: FormControl = new FormControl('dueDate', Validators.required);
        this.entityAttributeForm.addControl('dueDate', dueDate);


        //this.programCycleIdentifier = this.prog.getProgramCycleIdentifier(this.programAttributes);
        this.programWarehouseAttr = this.prog.getProgramAttributeByCode(this.programAttributes,"LMIS_WAREHOUSE");
        this.programCycleIdentifier = this.prog.getProgramAttributeByCode(this.programAttributes,"LMIS_CYCLES");
        this.programDeliveryZoneAttr = this.prog.getProgramAttributeByCode(this.programAttributes,"LMIS_DELIVERY_ZONE");
        this.programOrderTypeAttr = this.prog.getProgramAttributeByCode(this.programAttributes,"LMIS_ORDER_TYPE");
        this.programUniqueIdentifier = this.prog.getProgramIdentifier(this.programAttributes);
  
        this.cycles = this.programCycleIdentifier.trackedEntityAttribute.optionSet.options;
        this.orderTypes = this.programOrderTypeAttr.trackedEntityAttribute.optionSet.options;

        this.zone = this.orgunitService.getOrgUnitGroupByAttribute(this.orgUnitGroups,'LMIS_ATTR_DELIVERY_ZONE');
        this.warehouse = this.orgunitService.getOrgUnitGroupByAttribute(this.orgUnitGroups,'LMIS_ATTR_WAREHOUSE');
        //setTimeout(() =>{
            this.entityAttributeForm.addControl(this.programUniqueIdentifier.trackedEntityAttribute.id, this.programIdentifierControl);
            
            this.entityAttributeForm.addControl(this.programCycleIdentifier.trackedEntityAttribute.id, this.cyclesControl);
             this.entityAttributeForm.addControl(this.programWarehouseAttr.trackedEntityAttribute.id, this.programWarehouseControl);

            this.entityAttributeForm.addControl(this.programDeliveryZoneAttr.trackedEntityAttribute.id, this.programDeliveryControl);
           
            this.entityAttributeForm.addControl(this.programOrderTypeAttr.trackedEntityAttribute.id, this.programOrderTypeControl);
           
            /** Fill in the order number **/
          setTimeout(() =>{  
            this.prog.generateAndReserveId(this.programUniqueIdentifier.trackedEntityAttribute.id,1).subscribe((generated) =>{
              this.generatedValue = generated[0].value;
              this.entityAttributeForm.controls[this.programUniqueIdentifier.trackedEntityAttribute.id].setValue(this.generatedValue);
              this.uniqueNumberGenerated = true;
            },
            error => {
              this.notify.error("Identifier",error);
            });
            this.entityAttributeForm.get(this.programDeliveryZoneAttr.trackedEntityAttribute.id).setValue(this.zone.code);
            this.entityAttributeForm.get(this.programWarehouseAttr.trackedEntityAttribute.id).setValue(this.warehouse.code);


            /** To Do
             Re-check to ensure that there is only one optionSets for Cycles
            **/

            /** Initialize date **/
            let d: Date = new Date();
            this.selDate = {year: d.getFullYear(), 
                            month: d.getMonth() + 1, 
                            day: d.getDate()};

            setTimeout(() => {
                this.prog.getDataElementsByProgramStage(this.programTreeObject.id).subscribe((dataElements) =>{
                  this.programStageDataElements = dataElements.programStageDataElements;
                });               
            },0);
            this.addToOrder();
          },5);
        return this.selectedProgram;
    };
    onDateChanged(event: IMyDateModel) {
        // event properties are: event.date, event.jsdate, event.formatted and event.epoc
    }
    onDataValueChanged($event) {
      console.log("Value changed");
      console.log($event.target.value);

    }

    getCycle(cycle) { 

      let zoneData = (this.entityAttributeForm.value[this.programDeliveryZoneAttr.trackedEntityAttribute.id]).split(' '); // 0 = Drug Type, 1= Supplier Code, 2 = Zone
      let cycleOptionSets = this.dataSetService.getZoneCycles(this.lmisOptionSets.optionSets,zoneData[1]);
      this.dataSetService.getOptionSet(cycleOptionSets.id).subscribe((optionSet) => {
        let optionSetOptions = optionSet.optionSets[0].options;
        let zone = zoneData[2]+ ' '+ zoneData[3];
        let cyclesDeadlineByZone = this.dataSetService.getCycleDeadlineByZone(optionSetOptions,zone ,cycle);
        let deadline = this.dataSetService.getDeadlineDate(cyclesDeadlineByZone);
        if(!isUndefined(deadline)){
          let dueDateString: IMyDate = {
            year: moment(deadline.date,'YYYY-MM-DD').get('year'), 
            month: moment(deadline.date,'YYYY-MM-DD').get('month') + 1, 
            day: moment(deadline.date,'YYYY-MM-DD').get('date') 
          }; 
          this.entityAttributeForm.controls['dueDate'].setValue({ date: dueDateString,formatted:deadline.date });
        }
       
      });
    }
    /**
    Run program Rules
    **/
    runProgramRules(programRules,formValues){
      
      for(let programRule of programRules){
        for(let formValue in formValues){
          programRule.condition = (programRule.condition).replace(formValue,formValues[formValue])
        }
        if(eval(programRule.condition)){
          console.log("The rule " + JSON.stringify(programRule.condition) + " is true");
          for(let programRuleAction of programRule.programRuleActions){
            if(programRuleAction.programRuleActionType === 'ASSIGN'){
              for(let formValue in formValues){
                programRuleAction.data = (programRuleAction.data).replace(formValue,formValues[formValue]);
              }
              this.isReadOnly = true;
              let calculatedValue = eval(programRuleAction.data).toFixed(0);
              if(isNaN(calculatedValue)){
                calculatedValue = 0;
                this.notify.info("", "The calculated value is not a number and has been reset to 0");
              }
              else if(calculatedValue === 'Infinity'){
                calculatedValue = 0;
                this.notify.info("", "The calculated value is Infinity and has been reset to 0");
              }
              else{
                calculatedValue = calculatedValue;
              }
              this.trackerEntryFormGroup.get(programRuleAction.dataElement.id).setValue(calculatedValue);
            }
            else if(programRuleAction.programRuleActionType === 'ERRORONCOMPLETE'){
             for(let formValue in formValues){
                programRuleAction.content = (programRuleAction.content).replace(formValue,formValues[formValue]);
              }
              this.isHidden = false;
              this.notify.error("",programRuleAction.content);
              this.trackerEntryFormGroup.get(programRuleAction.dataElement.id).markAsDirty(true);
            }
            else if(programRuleAction.programRuleActionType === 'HIDEFIELD'){
             for(let formValue in formValues){
                programRuleAction.content = (programRuleAction.content).replace(formValue,formValues[formValue]);
              }
              this.isHidden = true;
              this.notify.error("",programRuleAction.content);
              this.trackerEntryFormGroup.get(programRuleAction.dataElement.id).disable(true);
              this.formService.findById(programRuleAction.dataElement.id, this.formModel).disabledUpdates.next(true);
            }
            else{
             for(let formValue in formValues){
                programRuleAction.content = (programRuleAction.content).replace(formValue,formValues[formValue]);
              }
              this.notify.info("",programRuleAction.content);
            }
          }
        }
        else{
          console.log("The rule" + JSON.stringify(programRule.condition) + " is false");
          
        }
      }
    }
    /** Submit Aggregate form
    **/
    submitDataEntryForm(){
      this.dataEntryFormLoaded = false;
    }
    /**
    **/
    getDataElementSelectedOptions(selectedValue,stageDataElements){
      if((!isUndefined(selectedValue)) && (!isUndefined(stageDataElements))){
        setTimeout(() => {
            let nOptionSets = this.dataSetService.getNOptionSetsFromDataElements(stageDataElements);
            this.dataSetService.getNOptionSet(nOptionSets).subscribe((optionSets) => { 
              let optionSet = this.dataSetService.getSearchOptionSet(optionSets.optionSets,selectedValue);
             
              if(!isUndefined(optionSet)){
                this.currentDataElementToUpdate = this.dataSetService.getDataElementWithOptionSet(stageDataElements,optionSet.id);
             
                this.optionsSearched = this.dataSetService.getOptionsByAttribute(optionSet,selectedValue);
              
                setTimeout(() => {
                  if(!isNullOrUndefined(this.optionsSearched)){

                   this.updateModel(this.formModel,this.currentDataElementToUpdate.id,this.formService,this.optionsSearched);
                  }
                },0);
                 
              }
              else{
                let errorMessage = "There are no options for " + selectedValue;
                this.notify.error("", errorMessage);
                this.optionsSearched = [];
                //this.updateModel(this.formModel,this.dataElementToUpdate.id,this.formService,this.optionsSearched);
                //this.trackerEntryFormGroup.get(this.dataElementToUpdate.id).disabled;
              }
            });

        },1);
      }
    }
   
}