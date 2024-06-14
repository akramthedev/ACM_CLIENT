import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ClientsComponent } from './clients.component';
import { DetailclientComponent } from './detailclient/detailclient.component';
const routes: Routes = [{
  path: '',
  children: [
    { path: '', component: ClientsComponent, },
    { path: 'details/:id', component: DetailclientComponent, },
  ]
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ClientsRoutingModule { }
