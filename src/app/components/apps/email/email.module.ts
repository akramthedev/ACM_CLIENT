import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { SharedModule } from "../../../shared/shared.module";

import { NgxEditorModule } from 'ngx-editor';
import { EmailRoutingModule } from './email-routing.module';
import { EmailComponent } from './email.component';

@NgModule({
  declarations: [EmailComponent],
  imports: [
    CommonModule,
    FormsModule,
    NgbModule,
    SharedModule,
    EmailRoutingModule,
    NgxEditorModule
  ]
})
export class EmailModule { }
