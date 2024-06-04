import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { AngularEditorModule } from '@kolkov/angular-editor';
import { SharedModule } from '../../shared/shared.module';
import { EditorRoutingModule } from './editor-routing.module';

import { NgxEditorModule } from 'ngx-editor';
import { EditorComponent } from './editor.component';

@NgModule({
  declarations: [EditorComponent],
  imports: [
    CommonModule,
    AngularEditorModule,
    EditorRoutingModule,
    NgxEditorModule,
    SharedModule
  ]
})
export class EditorModule { }
