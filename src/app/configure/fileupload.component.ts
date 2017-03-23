import { Component } from '@angular/core';
import { NgClass, NgStyle} from '@angular/common';
import { FileUploader, FileDropDirective, FileSelectDirective} from 'ng2-file-upload/ng2-file-upload';
import { Http, Response, URLSearchParams, Headers, RequestOptions } from '@angular/http';
import { Constants, NotifyService,OrgUnitService } from '../shared';

@Component({
  selector: 'file-upload',
  templateUrl: './fileupload.component.html',
  providers: [ OrgUnitService, NotifyService ]
})
export class FileUploadComponent {

  //public uploader:FileUploader = new FileUploader({url: ''});; 
  public hasBaseDropZoneOver:boolean = false;
  public hasAnotherDropZoneOver:boolean = false;
  private DHIS2URL: string;
  private importedData: any[] = [];
 
  constructor(
      private constant: Constants,
      private http: Http
      ){
      this.DHIS2URL = this.constant.ROOTURL;
      //this.uploader = new FileUploader({url: this.DHIS2URL});
  }
  public fileOverBase(e:any):void {
    this.hasBaseDropZoneOver = e;
  }
 
  public fileOverAnother(e:any):void {
    this.hasAnotherDropZoneOver = e;
  }
  getFile(event){
      this.importedData = this.getUploadedFile(event);

  }
  getUploadedFile(event) {
        let textData = [];
        let files = event.srcElement.files;
        if(files[0].name.includes(".csv"))
        {
           let input = event.target;
           let reader = new FileReader();
         
           reader.onload = function(){
             let csvData = reader.result;
             let allTextLines = csvData.split(/\r\n|\n/);
             let headers = allTextLines[0].split(',');
             let lines:any  = [];
             
             for (let i = 0; i < allTextLines.length; i++) {
              // split content based on comma
              let data = allTextLines[i].split(',');
              if (data.length == headers.length) {
                let tarr = [];
                for (let j = 0; j < headers.length; j++) {
                  tarr.push(data[j]);
                }
                lines.push(tarr);
              }

            }
            textData = lines;
          };

          reader.readAsText(input.files[0]);
          //this.http.post("localhost:5000/setData", text)
      }
      return textData;
    }

}