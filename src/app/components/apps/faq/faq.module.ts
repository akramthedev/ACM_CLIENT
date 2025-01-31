import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from "../../../shared/shared.module";
import { FaqRoutingModule } from './faq-routing.module';

import { FaqComponent } from './faq.component';
import { NgbAccordionModule, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';


@NgModule({
  declarations: [FaqComponent],
  imports: [
    CommonModule,
    FaqRoutingModule,
    NgbAccordionModule,
    NgbModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule
  ]
})
export class FaqModule { }
