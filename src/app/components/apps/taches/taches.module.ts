import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";

import { TachesRoutingModule } from "./taches-routing.module";
import { TachesComponent } from "./taches.component";
import { SharedModule } from "../../../shared/shared.module";
import { DataTablesModule } from "angular-datatables";

@NgModule({
  declarations: [TachesComponent],
  imports: [CommonModule, TachesRoutingModule, SharedModule, DataTablesModule],
})
export class TachesModule {}
