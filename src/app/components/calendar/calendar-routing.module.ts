import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FullCalendarModule } from '@fullcalendar/angular';
import { CalendarComponent } from './calendar.component';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule } from '@angular/forms';


const routes: Routes = [
  { path: '', component: CalendarComponent }
];

@NgModule({
  declarations: [CalendarComponent], // Declare the CalendarComponent
  imports: [
    FormsModule,
    CommonModule, // Required for Angular directives
    RouterModule.forChild(routes), // Add routing
    FullCalendarModule // Import FullCalendarModule
  ]
})
export class CalendarModule {}
