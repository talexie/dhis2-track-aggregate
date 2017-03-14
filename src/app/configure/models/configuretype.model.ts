import {
    DynamicFormControlModel,
    DynamicRadioGroupModel,

} from "@ng2-dynamic-forms/core";

export const CONFIGURE_TYPE_FORM_MODEL: Array<DynamicFormControlModel> = [
  
    new DynamicRadioGroupModel<string>(
        {
            id: "type",
            options: [
                {
                    label: "Programs",
                    value: "program",
                },
                {
                    label: "Messaging",
                    value: "messaging"
                }
            ]
            
        }
        
    )
    
];