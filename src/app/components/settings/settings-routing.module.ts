import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SettingsComponent } from './settings.component';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule } from '@angular/forms';


const routes: Routes = [
  { path: '', component: SettingsComponent }
];

@NgModule({
  imports: [
    FormsModule,
    CommonModule,  
    RouterModule.forChild(routes), 
    SettingsComponent
  ]
})
export class SettingsModule {}
