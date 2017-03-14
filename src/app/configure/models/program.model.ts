import {
    DynamicFormControlModel,
    DynamicCheckboxModel,
    DynamicInputModel,
    DynamicRadioGroupModel,
    DynamicSelectModel,
    DynamicCheckboxGroupModel,
    DynamicDatepickerModel,
    DynamicDateControlModel,
    DynamicTextAreaModel,
    DynamicSwitchModel
} from "@ng2-dynamic-forms/core";

export const PROGRAM_FORM_MODEL: Array<DynamicFormControlModel> = [
	new DynamicInputModel({

        id: "name",
        maxLength: 250,
        placeholder: "Name"
    }),

    new DynamicTextAreaModel({

        id: "description",
        rows: 5,
        placeholder: "Template Description",
        validators: {
            required: null
        },
        errorMessages: {
            required:"Field is required"
        }
    })/*,

    new DynamicSelectModel<string>(
        {
            id: "warehouse",
            options: [
                {
                    label: "Option 1",
                    value: "option-1",
                },
                {
                    label: "Option 2",
                    value: "option-2"
                },
            ],
            relation: [
	            {
	                action: "DISABLE",
	                when: [
	                    {
	                        id: "program",
	                        value: true
	                    }
	                ]
	            }
	        ],
            placeholder: "Select Warehouse OptionSet"
        }
    )*/
];

export const PROGRAM_LAST_FORM_MODEL = [   
    new DynamicRadioGroupModel<boolean>(
        {
            id: "cycleEnabled",
            options: [
                {
                    label: "Enabled",
                    value: true,
                },
                {
                    label: "Disabled",
                    value: false
                }
            ]
            
        }
        
    ),
    new DynamicSwitchModel({

        id: "enabled",
        offLabel: "Off",
        onLabel: "On",
        value: true
    })
];