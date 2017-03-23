import { Injectable } from '@angular/core';
import { Http, Response, URLSearchParams, Headers, RequestOptions } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { ReplaySubject, Subject,AsyncSubject } from 'rxjs';
import {
    DynamicFormControlModel,
    DynamicCheckboxModel,
    DynamicInputModel,
    DynamicSelectModel,
    DynamicDatepickerModel,
    DynamicRadioGroupModel,
    DynamicTextAreaModel,
    DynamicFormOption,
    DYNAMIC_FORM_CONTROL_TYPE_SELECT
} from '@ng2-dynamic-forms/core';
import { isUndefined,isNull,isArray,isNullOrUndefined} from 'util';

import 'rxjs';
// Statics
import 'rxjs/add/observable/throw';

// Operators
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/distinctUntilChanged';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/switchMap';
import 'rxjs/add/operator/toPromise';
import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/toPromise';
import 'rxjs/add/operator/reduce';

import { Constants, NotifyService } from '../../shared';

@Injectable()
export class ProgramService {

  public value = 'Programs';
  private DHIS2URL:string;
  private programs: any[];
  private numberOfUids: Number = 20;

  constructor(
    private http: Http,
    private constant: Constants,
    private notify: NotifyService
  ) {
    this.DHIS2URL = this.constant.ROOTURL;  // URL to web API
  }

  public getPrograms(){

    return this.http.get(this.DHIS2URL + 'api/programs.json?paging=false&fields=id,name,shortName,programType,programStages[id,name,program[id,trackedEntity],notificationTemplates[*]],programTrackedEntityAttributes[id,name,mandatory,valueType,allowFutureDate,displayInList,trackedEntityAttribute[id,name,code,displayName,generated,unique,pattern,optionSet[id,options[id,code,name]]]]')
      .map((res:Response) => res.json())
      .catch(this.notify.handleError);;
  }
  /**
  get program rule variables by program
  **/
  public getProgramRuleVariables(program){

    return this.http.get(this.DHIS2URL + 'api/programRuleVariables.json?fields=id,displayName,programRuleVariableSourceType,program[id],programStage[id],dataElement[id],trackedEntityAttribute[id],useCodeForOptionSet&filter=program.id:eq:' + program + '&paging=false')
      .map((res:Response) => res.json())
      .catch(this.notify.handleError);;
  }
  /**
  Get program rules by program
  **/
  public getProgramRules(program){
    return this.http.get(this.DHIS2URL + 'api/programRules.json?fields=id,displayName,condition,description,program[id],programStage[id],priority,programRuleActions[id,content,location,data,programRuleActionType,programStageSection[id],dataElement[id],trackedEntityAttribute[id],programIndicator[id],programStage[id]]&filter=program.id:eq:' + program + '&paging=false')
      .map((res:Response) => res.json())
      .catch(this.notify.handleError);;
  }
  /**
  Get program indicators by program
  **/
  public getProgramIndicators(program){
    return this.http.get(this.DHIS2URL + 'api/programIndicators.json?fields=id,displayName,code,shortName,displayInForm,expression,displayDescription,rootDate,description,valueType,filter&filter=program.id:eq:' + program + '&paging=false')
      .map((res:Response) => res.json())
      .catch(this.notify.handleError);;
  }

   /** 
  Get data Elements by Stage
  **/
  getDataElementsByProgramStage(programStageId:string){
    return this.http.get(this.DHIS2URL + 'api/programStages/' + programStageId + '/programStageDataElements.json?fields=dataElement[id,name,code,attributeValues[value,attribute[id,name,code]]]&paging=false')
      .map((res:Response) => res.json())
      .catch(this.notify.handleError);;
  }
  /**
  Get stage data elements metadata
  **/
  getProgramStageDataElementsMetaData(programStageId:string){

    return this.http.get(this.DHIS2URL + 'api/programStages/' + programStageId + '/programStageDataElements.json?paging=false&fields=id,compulsory,dataElement[id,name,code,shortName,formName,domainType,aggregateType,valueType,optionSet[id,name,valueType,options[id,name|rename(label),code|rename(value)]]')
      .map((res:Response) => res.json())
      .catch(this.notify.handleError);;
  }
  /** Generate system uids 
  **/
  public getSystemUids(uidNumber){
    if(uidNumber < 3 || isUndefined(uidNumber)){
      uidNumber = this.numberOfUids
    }
    return this.http.get(this.DHIS2URL + '/api/system/id.json?limit=' + uidNumber)
      .map((res:Response) => res.json())
      .catch(this.notify.handleError);
  }


  /**
   Create payload for WebAPI
  **/ 
  createWebApiPayload(uids,eventsData,entityAttributeForm,selectedProgramStage,orgUnit){
    let payload: any = {};
    let tei: any = {};
    payload.trackedEntityInstances = [];
    //tei.enrollments = [];
    payload.enrollments = [];
    tei.attributes = [];
    let teiEnrollments: any = {};
    let program: string = '';

    let events: any = [];
    //console.log("program stage meta " + JSON.stringify(selectedProgramStage));
    if((isUndefined(selectedProgramStage[0].children)) && (!isUndefined(selectedProgramStage))){
       tei.trackedEntity = selectedProgramStage[0].program.trackedEntity.id;
       program = selectedProgramStage[0].program.id; // Not required for entity creation     
    }
    else{
          console.log("Please choose a program stage");
          return;
    }
    tei.trackedEntityInstance = uids.codes[0];

    tei.orgUnit = orgUnit;
    // Attributes

    for(let attribute in entityAttributeForm){
      if((attribute === 'incidentDate') || (attribute === "dueDate")){
        
      }
      else{
        tei.attributes.push({ attribute: attribute, value: entityAttributeForm[attribute]});
      }
      
    }
    // Enrollments
    teiEnrollments.program = program;
    teiEnrollments.orgUnit = tei.orgUnit;
    teiEnrollments.trackedEntityInstance = tei.trackedEntityInstance;
    teiEnrollments.enrollment = uids.codes[1];
    teiEnrollments.incidentDate = entityAttributeForm.incidentDate.formatted;
    teiEnrollments.enrollmentDate = entityAttributeForm.incidentDate.formatted;
     // Add coordinate to enrollment object
     /**
     teiEnrollments.coordinate = { latitude: 10.0, longitude: 30.2 }
     **/
    //tei.enrollments.push(teiEnrollments);
    payload.enrollments.push(teiEnrollments);
    payload.trackedEntityInstances.push(tei);
    uids.codes.splice(0,2); // Delete the used uid from UIDs array
    //console.log("Events " + JSON.stringify(eventsData));
    // Events
    for (let event of eventsData){
       //console.log("Event " + JSON.stringify(event));
       event.orgUnit = orgUnit;
       event.trackedEntityInstance = tei.trackedEntityInstance;
       event.enrollment = teiEnrollments.enrollment;
       event.enrollmentStatus = 'ACTIVE';
       event.eventDate = entityAttributeForm.incidentDate.formatted;
       event.status = 'COMPLETED';
       event.dueDate = entityAttributeForm.dueDate.formatted;
       events.push(event);
    }
    payload.events = events;
    return payload;
  }

  /** Create events data for web Api from table list data 
  **/
  createEvents(tableListData,selectedProgram){
    let eventApiData: any = [];
    for (let listEventObject of tableListData){
      let eventApiDataObject: any = {};
      eventApiDataObject.dataValues = [];
      for ( let listEvent in listEventObject){
        let dataValuesObject: any = {};
        
        if((isUndefined(selectedProgram[0].children)) && (!isUndefined(selectedProgram))){
          eventApiDataObject.programStage = selectedProgram[0].id;
          eventApiDataObject.program = selectedProgram[0].program.id;

          dataValuesObject.dataElement = listEvent;
          dataValuesObject.value = listEventObject[listEvent]; 

          //var listEventKey = 
          eventApiDataObject.dataValues.push(dataValuesObject);
        }
        else{
          console.log("Please choose a program stage");
        }       
      }
      eventApiData.push(eventApiDataObject);
    }
    return eventApiData;
  }
  /** Create a form model 
  ** 
  **/
  createProgramStageFormModel(programStageFormModel,trackerFields, formLoaded){
    if(!formLoaded){
      Observable.from(trackerFields).subscribe(function(fields: any){
        if(formLoaded){
          programStageFormModel = programStageFormModel;
        }
        else{
          programStageFormModel.push(fields);
        }
      },
      function(error){
        console.log("Error" + error);
      },
      function(){
        console.log("Program stages data elements merged");
      });
    }
    return programStageFormModel;

  }
  /** Get Programs ids and names
  **/
  getProgramIdName(programs){
    
    let programIdNamesArray: any[] = [];

    Observable.from(programs).subscribe(function(program:any){
        let programIdNames: any = {};
        programIdNames.id = program.id;
        programIdNames.name = program.name;
        programIdNamesArray.push(programIdNames);
    },
    function(error){
      console.log("Error" + error);
    },
    function(){
      console.log("Programs retrieved");
    });
    return programIdNamesArray;
  }

  /** Get program stage data elements
  **/
  getProgramStageDataElements(dataElementsMeta,programStage){
    
    let programStageDataElementsArray: any[] = [];
    let programStageData: any = [];
    if(dataElementsMeta.id === programStage){
        programStageDataElementsArray = this.getDataElementsStageModel(dataElementsMeta);
    }
    return programStageDataElementsArray;
  }

  /** Get program attributes
  **/
  getProgramAttributes(programAttributesMeta){
    return programAttributesMeta.programTrackedEntityAttributes;
  }

  /** Get unique program attribute [Order Number] **/

  getProgramIdentifier(attributes){
    let identifier: any = {};
    if(!isUndefined(attributes)){
      for(let attribute of attributes){
        if(attribute.trackedEntityAttribute.unique){
          identifier = attribute;
        }
        else{
          /** No unique attribute set, dont proceed with out an order reference **/
        }
      }
    }
    return identifier;
  }

  /** Get cycle program attribute [Cycles], if Cycles is enabled **/

  getProgramCycleIdentifier(attributes){
    let cycleIdentifier: any = {};
    /** TO DO
     Check if cycles is enabled in the settings 
     Only two attributes are allowed on the LMIS program
    **/

    if(!isUndefined(attributes)){
      for(let attribute of attributes){
        if(!attribute.trackedEntityAttribute.unique){
          cycleIdentifier = attribute;
        }
        else{
          /** No cycles attribute set, dont proceed with out an order reference **/
        }
      }
    }
    return cycleIdentifier;
  }
  /** Get cycle program attribute [Cycles], if Cycles is enabled **/

  getProgramAttributeByCode(attributes,code){
    let attributeObject: any = {};
    /** TO DO
     Check if cycles is enabled in the settings 
     Only two attributes are allowed on the LMIS program
    **/

    if(!isUndefined(attributes)){
      for(let attribute of attributes){
        if(!attribute.trackedEntityAttribute.unique){
          if(attribute.trackedEntityAttribute.code === code ){
            attributeObject = attribute;
          }          
        }
        else{
          /** No cycles attribute set, dont proceed with out an order reference **/
        }
      }
    }
    return attributeObject;
  }

  /** Get program from metadata **/
  getProgram(metadata, program){

    let programs:any = [];
    Observable.from(metadata).subscribe(function(prog: any){
      if(prog.id === program){
        programs = prog;
      }
      
    },
    function(error){
      console.log("Error loading program");

    },
    function(){
      console.log("Program loaded");
    });
    return programs;
  }
  getProgramStage(programMetaData, programStage){
    let programStages:any = [];
    Observable.from(programMetaData.programStages).subscribe(function(stage: any){
      if(stage.id === programStage){
        programStages = stage;
      }
    }, 
    function(error){
      console.log("Error loading program stage");

    },
    function(){
      console.log("Program stage loaded");
    });
    return programStages;
  }
  getDataElementsStageModel(dataElements){

    let dataElementsArray: any[] = [];
    if(!isNullOrUndefined(dataElements)){
      Observable.from(dataElements).subscribe(function(dataElement:any){
          let programStageDataElementsFormFields:any = {};
          programStageDataElementsFormFields.id = dataElement.dataElement.id;
          //programStageDataElementsFormFields.label = dataElement.dataElement.formName;
          programStageDataElementsFormFields.placeholder = dataElement.dataElement.formName;
          programStageDataElementsFormFields.validators = {};
          if(dataElement.compulsory){
            programStageDataElementsFormFields.validators = { required:  null };
            
          }       
          
          programStageDataElementsFormFields.errorMessages = { required: dataElement.dataElement.formName + ' is required'};

          if(dataElement.dataElement.valueType ==='TEXT'){
            if(!isUndefined(dataElement.dataElement.optionSet)){
              programStageDataElementsFormFields.options = dataElement.dataElement.optionSet.options;
              dataElementsArray.push(
                new DynamicSelectModel<string>(
                    programStageDataElementsFormFields 
                )
              );
            }
            else{
              
              dataElementsArray.push(
                new DynamicInputModel(
                  programStageDataElementsFormFields

                )
              );
            }
          }
          else if(dataElement.dataElement.valueType ==='DATE'){
            programStageDataElementsFormFields.inputType = 'date';
            programStageDataElementsFormFields.inline = true;
            dataElementsArray.push(
              new DynamicDatepickerModel(

                programStageDataElementsFormFields
              )
            );
          }
          else if(dataElement.dataElement.valueType ==='TIME'){
            programStageDataElementsFormFields.inputType = 'time';
            programStageDataElementsFormFields.inline = true;
            dataElementsArray.push(
              new DynamicDatepickerModel(

                programStageDataElementsFormFields
              )
            );
          }
          else if(dataElement.dataElement.valueType ==='LONG_TEXT'){
            programStageDataElementsFormFields.rows = 3;
            dataElementsArray.push(
              new DynamicTextAreaModel(

                programStageDataElementsFormFields
              )
            );
          }
          else if((dataElement.dataElement.valueType ==='INTEGER_POSITIVE') || (dataElement.dataElement.valueType ==='INTEGER_ZERO_OR_POSITIVE')){
            programStageDataElementsFormFields.validators.pattern = '^[0-9]{1,9}$';
            programStageDataElementsFormFields.value = 0;
            dataElementsArray.push(
              new DynamicInputModel(

                programStageDataElementsFormFields
              )
            );
          }
          else if(dataElement.dataElement.valueType ==='INTEGER_NEGATIVE'){
            programStageDataElementsFormFields.validators.pattern = '^[-]?[0-9]{1,9}$';
            programStageDataElementsFormFields.value = 0;
            dataElementsArray.push(
              new DynamicInputModel(

                programStageDataElementsFormFields
              )
            );
          }
          else if(dataElement.dataElement.valueType ==='INTEGER'){
            programStageDataElementsFormFields.validators.pattern = '^[-]?[0-9]{1,9}$';
            programStageDataElementsFormFields.value = 0;
            dataElementsArray.push(
              new DynamicInputModel(

                programStageDataElementsFormFields
              )
            );
          }
          else if((dataElement.dataElement.valueType ==='NUMBER') || (dataElement.dataElement.valueType ==='PERCENTAGE')){
            programStageDataElementsFormFields.validators.pattern = '^(([-]?[0-9]{1,9})|([-]?[0-9]{1,9}[.][0-9]{1,9}))$';
            programStageDataElementsFormFields.value = 0.0;
            dataElementsArray.push(
              new DynamicInputModel(

                programStageDataElementsFormFields
              )
            );
          }
          else{
            dataElementsArray.push(
              new DynamicInputModel(
                programStageDataElementsFormFields
              )
            );
          }
          
      },
      function(error){
        console.log("Error" + error);
      },
      function(){
        console.log("Programs stage data elements retrieved");
      });
    }
    return dataElementsArray;
  }
  /** 
  Create a program tracked attribute model
  **/
  getProgramTrackedEntityAttributesModel(programAttributes){

    let programTrackedEntityAttributesArray: any[] = [];

    Observable.from(programAttributes.programTrackedEntityAttributes).subscribe(function(trackedEntityAttribute:any){
        let programTrackedEntityAttributesFormFields:any = {};
        programTrackedEntityAttributesFormFields.id = trackedEntityAttribute.trackedEntityAttribute.id;
        programTrackedEntityAttributesFormFields.label = trackedEntityAttribute.trackedEntityAttribute.displayName;
        programTrackedEntityAttributesFormFields.placeholder = trackedEntityAttribute.trackedEntityAttribute.displayName;

        // Check mandatory, unique, generated, pattern
        if(trackedEntityAttribute.trackedEntityAttribute.valueType ==='TEXT'){
          if(!isUndefined(trackedEntityAttribute.trackedEntityAttribute.optionSet)){
            programTrackedEntityAttributesFormFields.options = trackedEntityAttribute.trackedEntityAttribute.optionSet.options;
            programTrackedEntityAttributesArray.push(
              new DynamicSelectModel<string>(
                  programTrackedEntityAttributesFormFields 
              )
            );
          }
          else{
            programTrackedEntityAttributesArray.push(
              new DynamicInputModel(
                programTrackedEntityAttributesFormFields
              )
            );
          }
        }
        else if(trackedEntityAttribute.trackedEntityAttribute.valueType ==='DATE'){
          programTrackedEntityAttributesFormFields.inline = true;
          programTrackedEntityAttributesArray.push(
            new DynamicDatepickerModel(

              programTrackedEntityAttributesFormFields
            )
          );
        }
        else{
          programTrackedEntityAttributesArray.push(
            new DynamicInputModel(
              programTrackedEntityAttributesFormFields
            )
          );
        }
        
    },
    function(error){
      console.log("Error" + error);
    },
    function(){
      console.log("Program attributes retrieved");
    });
    return programTrackedEntityAttributesArray;
  }

  /**
  Extract the table List titles from program metadata
  **/
  createStageTableHeadings(dataElements){
    let tableHeadingsArray: any = [];
    let tableHeadingsColumns: any = {};
    if(!isNullOrUndefined(dataElements)){
      Observable.from(dataElements).subscribe(function(dataElement:any){
          let tableHeadings: any = {};
          let columnKey = dataElement.dataElement.id;
          tableHeadings = { key: columnKey, title: dataElement.dataElement.formName,class:"tableSmartHeading" };
          tableHeadingsArray.push(tableHeadings);
      },
      function(error){
        console.log("Error" + error);
      },
      function(){
        console.log("Programs stage table headings retrieved");
      });
    }
    tableHeadingsColumns = JSON.parse(this.createStringFromArray(tableHeadingsArray));
    return tableHeadingsColumns;
  }
  createStringFromArray(arrObject){
    var stringObject = '{ "columns" : { ';
    arrObject.forEach((obj,idx) => {
      if((arrObject.length -1) === idx){
        stringObject += ('"' + obj.key + '" : { "title" : "' + obj.title + '"}');
        stringObject += "}}";
      }
      else{
        stringObject += ('"' + obj.key + '" : { "title": "' + obj.title + '"}');
        stringObject +=",";
      }
    });
    return stringObject;
  }
  postTrackedEntity(trackedEntities) {
    let headers = new Headers({ 'Content-Type': 'application/json' });
    let options = new RequestOptions({ headers: headers });
   
    return this.http.post(this.DHIS2URL + 'api/trackedEntityInstances?strategy=CREATE_AND_UPDATE', trackedEntities, headers).map((res: Response) => res.json());
  }

  postEnrollments(enrollments) {
    let headers = new Headers({ 'Content-Type': 'application/json' });
    let options = new RequestOptions({ headers: headers });

    return this.http.post(this.DHIS2URL + 'api/enrollments?strategy=CREATE_AND_UPDATE', enrollments, headers).map((res: Response) => res.json());
  }

  postEvent(events) {
    let headers = new Headers({ 'Content-Type': 'application/json' });
    let options = new RequestOptions({ headers: headers });
  
    return this.http.post(this.DHIS2URL + 'api/events?strategy=CREATE_AND_UPDATE', events, headers).map((res: Response) => res.json());
  }
  submitTrackedEntityAndEvent(trackedEntityAndEvents){
    let eventsHandler: any = {};
    let teiHandler: any = {};
    let enrollmentHandler: any = {};
    if(!isUndefined(trackedEntityAndEvents)){
      teiHandler.trackedEntityInstances = trackedEntityAndEvents.trackedEntityInstances;
      this.postTrackedEntity(teiHandler).subscribe((submitted) =>
      {
        console.log("Tracked Entity has been submitted");
        enrollmentHandler.enrollments = trackedEntityAndEvents.enrollments;
        this.postEnrollments(enrollmentHandler).subscribe((submittedEnrollment) =>
        {
          console.log("Tracked Entity has been enrolled");
          eventsHandler.events = trackedEntityAndEvents.events;
          this.postEvent(eventsHandler).subscribe((submittedEvents) =>
          {
            console.log("Events has been submitted");
           
          });
        });
      });
      
    }
  }
  /** Retrieve the programs assigned to the selected program **/
  getProgramsByOrgUnit(orgUnit){
    return this.http.get(this.DHIS2URL + 'api/organisationUnits/' + orgUnit + '.json?paging=false&fields=programs[id,name,shortName,programType,programStages[id,name,program[id,trackedEntity]]],organisationUnitGroups[id,name,code,organisationUnitGroupSet[id,name,code,attributeValues[value,attribute[id,code]]]],ancestors[id,name,level]')
      .map((res:Response) => res.json());
  }
  /**
  Generate value and reserve it for use as Order identifier.
  **/
  generateAndReserveId(attribute,limit){
    return this.http.get(this.DHIS2URL + 'api/trackedEntityAttributes/' + attribute + '/generateAndReserve.json?numberToReserve=' + limit)
      .map((res:Response) => res.json());
  }

  getGenerateAndReserveId(attribute,limit){
    let generatedValue: string = '';
    this.generateAndReserveId(attribute,limit).subscribe((generated) =>{
     generatedValue = generated[0].value;
    },
    error => {
      console.log("Identifier",error);
    });
  }

  getGeneratorAttributeValue(programsMetaData){
    let attributeValue: any = [];
    for(let program of programsMetaData){

      for(let attrValue  of program.programTrackedEntityAttributes){
        if(attrValue.trackedEntityAttribute.generated){
          attributeValue.push({ program: program.id,[attrValue.trackedEntityAttribute.id]: this.getGenerateAndReserveId(attrValue.trackedEntityAttribute.id,1) });
        }
      }
    }
    return attributeValue;
  }
  filterGeneratedAttributeByProgram(attributeGeneratedValues,program){
    let filteredAttributeValue: any = {};
    if((!isUndefined(attributeGeneratedValues)) && (!isUndefined(program))){
      for(let generatedValue of attributeGeneratedValues){
        if(generatedValue.program === program){
          filteredAttributeValue = generatedValue;
        }
      }
    }
    else{
      console.log("The generated value process has failed.");
    }
    return filteredAttributeValue;
  }
  /** Apply program rules
     Matcher RegExp: /[A#]{\w+.?\w*}/g

    Apply program Rules for calculated fields
  **/

  applyProgramRules(programRules,programRuleVariables,attributeFormGroupValues){
    let programRulesWithActions: any = [];
    for(let programRule of programRules){
      for(let programRuleVariable of programRuleVariables){
        if(programRuleVariable.programRuleVariableSourceType === 'DATAELEMENT_CURRENT_EVENT')
        {
          programRule.condition = (programRule.condition).replace('#{' + programRuleVariable.displayName + '}',programRuleVariable.dataElement.id);
        }
      }
      for(let programRuleVariable of programRuleVariables){
        for(let programRuleAction of programRule.programRuleActions){
          //if(!isNull((programRuleAction.data).match(programRuleVariable.displayName))){
            if(programRuleVariable.programRuleVariableSourceType === 'DATAELEMENT_CURRENT_EVENT'){
              if(programRuleAction.programRuleActionType === 'ASSIGN'){
                
                programRuleAction.data = (programRuleAction.data).replace('#{' + programRuleVariable.displayName +'}',programRuleVariable.dataElement.id);
              }
              else{
              programRuleAction.content = (programRuleAction.content).replace('#{' + programRuleVariable.displayName +'}',programRuleVariable.dataElement.id);
              }
            }
          //}
        }
      }
      programRulesWithActions.push(programRule);
    }
    return programRulesWithActions;
  }

  /** Get program stage data elements without model
  **/
  getProgramStageDataElementsNoModel(dataElementsMeta){
    
    let programStageDataElementsArray: any[] = [];
    if(!isNullOrUndefined(dataElementsMeta)){
      Observable.from(dataElementsMeta).subscribe(function(dataElements:any){
        let dataElement:any = {};
        
        if(dataElements.dataElement.valueType ==='TEXT'){
          if(!isUndefined(dataElements.dataElement.optionSet)){
            dataElement.id = dataElements.dataElement.id;
            dataElement.optionSetId = dataElements.dataElement.optionSet.id;
            dataElement.options = dataElements.dataElement.optionSet.options;
          }
        }
        programStageDataElementsArray.push(dataElement);
      },
      function(error){
        console.log("Error" + error);
      },
      function(){
        console.log("Program dataelements optionSets retrieved");
      });
    }
    return programStageDataElementsArray;
  }
  /**
  update data element stage Model 
  **/
  updateSelectModel(formModel,id,formService,options){
    if((!isUndefined(options)) && (!isNull(options))){
      let inputModel = <DynamicSelectModel<string>>formService.findById(id, formModel);
      if(!isNullOrUndefined(inputModel)){
        inputModel.options = options;
        //inputModel.select(0);
        inputModel.valueUpdates.next("Select Option");
        return inputModel;
      }      
    }
  }
}
