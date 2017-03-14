/*
 * Angular 2 decorators and services
 */
import {Component, ViewEncapsulation, Input, ElementRef, Renderer} from '@angular/core';
import {FormsModule, NgModel} from '@angular/forms';

import {DynamicComponentModuleFactory} from 'angular2-dynamic-component/index';

export const DYNAMIC_MODULE = DynamicComponentModuleFactory.buildModule([ FormsModule ]);


@Component({
  selector: 'DynamicTextField',       // Can be absent => selector === "TextField"
  template: `<input name="{{fieldName}}" type="text" [value]="value" />`,
  providers: [TextField],
})

export class TextField {
  @Input() fieldName: string;
  @Input() value: string;

  constructor(private elementRef: ElementRef, private renderer: Renderer) {
    console.log('The constructor of TextField is called');  // The constructor of TextField is called
  }

  ngOnInit() {
    setTimeout(() => this.value = this.fieldName + ': next value', 4000);
    this.elementRef.nativeElement.childNodes[0].style.color = 'red';
  }
}

@Component({
  selector: 'DynamicCheckboxField',       // Can be absent => selector === "CheckboxField"
  template: `<input name="{{fieldName}}" type="checkbox" [checked]="value">`,
})

export class CheckboxField {
  @Input() fieldName: string;
  @Input() value: boolean;

  constructor() {
    console.log('The constructor of CheckboxField is called');  // The constructor of CheckboxField is called
  }

  ngOnInit() {
    setTimeout(() => this.value = !this.value, 2000);
  }
}

@Component({
  template: `<input name="{{fieldName}}" type="radio" [checked]="value">`,
})
export class RadioField {
  @Input() fieldName: string;
  @Input() value: boolean;

  constructor() {
    console.log('The constructor of RadioField is called');  // The constructor of RadioField is called
  }

  ngOnInit() {
    setTimeout(() => this.value = !this.value, 3000);
  }
}
