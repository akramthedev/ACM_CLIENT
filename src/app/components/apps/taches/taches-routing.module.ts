import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TachesComponent } from './taches.component';

const routes: Routes = [
  {
    path: "",
    children: [
      {
        path: "",
        component: TachesComponent,
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TachesRoutingModule { }
