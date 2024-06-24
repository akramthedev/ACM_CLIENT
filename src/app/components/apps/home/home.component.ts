import { Component, OnInit, ViewChild } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { ClientService } from 'src/app/shared/services/client.service';
import * as data from "../../../shared/data/dashboard/default";
import * as chartData from '../../../shared/data/dashboard/default'

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {


  titre: String;
  public purchase = data.purchase
  public salesReturn = data.salesReturn
  public sales = data.sales
  public purchaseRate = data.purchaseRate


  public show: boolean = false

  public activity = [
    {
      date: "8th March, 2022",
      title: "Updated Product",
      dace: "Quisque a consequat ante sit amet magna...",
      time: "1 day ago",
      primaryDotColor: "primary"
    },
    {
      date: "15th Oct, 2022",
      title: "Tello just like your product",
      dace: "Quisque a consequat ante sit amet magna...",
      time: "Today",
      primaryDotColor: "warning"
    },
    {
      date: "20th Sep, 2022",
      title: "Tello just like your product",
      dace: "Quisque a consequat ante sit amet magna...",
      time: "12:00 PM",
      primaryDotColor: "secondary"
    },
  ]

  public timeLine = chartData.timeLine;


  constructor(
    private title: Title,
    private router: Router,
    private clientService: ClientService,
    private loader: NgxSpinnerService,
    private toastr: ToastrService,
  ) {
    this.title.setTitle("Accueil | CRM");
    this.titre = this.title.getTitle();
  }


  ngOnInit() {
  }


}
