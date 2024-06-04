import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
// import { Ng2SearchPipeModule } from 'ng2-search-filter';
import { SharedModule } from "../../../shared/shared.module";
import { KnowledgeBaseRoutingModule } from './knowledge-base-routing.module';

import { KnowledgeBaseComponent } from './knowledge-base.component';
import { NgbAccordionModule, NgbModal } from '@ng-bootstrap/ng-bootstrap';

@NgModule({
  declarations: [KnowledgeBaseComponent],
  imports: [
    CommonModule,
    KnowledgeBaseRoutingModule,
    FormsModule,
    NgbAccordionModule,
    SharedModule,
    // Ng2SearchPipeModule
  ]
})
export class KnowledgeBaseModule { }
