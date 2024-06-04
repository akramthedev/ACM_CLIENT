import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BaseInputsComponent } from './form-controls/base-inputs/base-inputs.component';
import { CheckboxRadioComponent } from './form-controls/checkbox-radio/checkbox-radio.component';
import { FormValidationComponent } from './form-controls/form-validation/form-validation.component';
import { InputGroupsComponent } from './form-controls/input-groups/input-groups.component';
import { MegaOptionsComponent } from './form-controls/mega-options/mega-options.component';
import { TouchspinComponent } from './form-widgets/touchspin/touchspin.component';
import { Select2Component } from './form-widgets/ngselect/select2.component';
import { SwitchComponent } from './form-widgets/switch/switch.component';
import { ClipboardComponent } from './form-widgets/clipboard/clipboard.component';
import { DefaultFormComponent } from './form-Layouts/default-form/default-form.component';

const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: "form-controls",
        children: [
          {
            path: 'validation',
            component: FormValidationComponent
          },
          {
            path: 'inputs',
            component: BaseInputsComponent
          },
          {
            path: 'checkbox-radio',
            component: CheckboxRadioComponent
          },
          {
            path: 'input-groups',
            component: InputGroupsComponent
          },
          {
            path: 'mega-options',
            component: MegaOptionsComponent
          },
        ]
      },
      {
        path: "form-widgets",
        children: [
          {
            path: "touchspin",
            component: TouchspinComponent,
          },
          {
            path: "ngselect",
            component: Select2Component
          },
          {
            path: "switch",
            component: SwitchComponent
          },
          {
            path: "clipboard",
            component: ClipboardComponent
          },
        ]
      },
      {
        path: "form-layout",
        children: [
          {
            path: "default-form",
            component: DefaultFormComponent
          },
        ]
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FormsRoutingModule { }
