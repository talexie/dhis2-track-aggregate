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

export const MESSAGE_FORM_MODEL: Array<DynamicFormControlModel> = [
	new DynamicInputModel({

       // hint: "Just a hint",
        id: "name",
        maxLength: 250,
        placeholder: "Name"
    }),

    new DynamicTextAreaModel({

        id: "description",
        //label: "Example Textarea",
        rows: 5,
        placeholder: "Template Description",
        validators: {
            required: null
        },
        errorMessages: {
            required:"Field is required"
        }
    }),
	new DynamicRadioGroupModel<string>({

        id: "messageType",
        //label: "Example Option",
        options: [
	        { label: 'Approval', value: 'approval' },
          	{ label: 'Submission', value: 'submission' },
	        { label: 'Reminder', value: 'reminder' },
	        { label: 'Completeness', value: 'completeness' },
	        { label: 'Schedule', value: 'schedule' },
	        { label: 'Accept', value: 'accept'}
        ],
        value: "submission"
    }),
    

    new DynamicCheckboxGroupModel(
        {
            id: "assign",
            group: [
                new DynamicCheckboxModel(
                    {
                        id: "program",
                        label: "Programs"
                    }
                ),
                new DynamicCheckboxModel(
                    {
                        id: "userGroup",
                        label: "User Groups"
                    }
                ),
                new DynamicCheckboxModel(
                    {
                        id: "orgUnitGroup",
                        label: "Organisation Unit Groups"
                    }
                ),
                new DynamicCheckboxModel(
                    {
                        id: "dataSet",
                        label: "Datasets"
                    }
                )
            ]
        }
    ),
    new DynamicSelectModel<string>(
        {
            id: "programs",
            multiple: true,
            //label: "Example Select",
            options: [
                {
                    label: "Option 1",
                    value: "option-1",
                },
                {
                    label: "Option 2",
                    value: "option-2"
                },
                {
                    label: "Option 3",
                    value: "option-3"
                },
                {
                    label: "Option 4",
                    value: "option-4"
                }
            ],
            relation: [
	            {
	                action: "ENABLE",
	                when: [
	                    {
	                        id: "program",
	                        value: true
	                    }
	                ]
	            }
	        ],
            placeholder: "Select Programs"
        }
    ),
    

    new DynamicSwitchModel({

        id: "enabled",
        offLabel: "Off",
        onLabel: "On",
        value: false
    })
];