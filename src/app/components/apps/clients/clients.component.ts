import { Component, OnInit, ViewChild } from '@angular/core';
import { AddClientComponent } from "./modal/add-client/add-client.component";
import { AddCategoryComponent } from "./modal/add-category/add-category.component";
import { PrintContactComponent } from "./modal/print-contact/print-contact.component";
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-clients',
  templateUrl: './clients.component.html',
  styleUrls: ['./clients.component.scss']
})
export class ClientsComponent implements OnInit {

  @ViewChild("addClient") AddClient: AddClientComponent;
  @ViewChild("addCategory") AddCategory: AddCategoryComponent;
  @ViewChild("print") Print: PrintContactComponent;

  public history: boolean = false;
  public editContact: boolean = false;

  CurrentClient: any = null;

  Clients: any[] = [
    { ClientId: "01", Nom: "Barnes", Prenom: "Bucky", DateNaissance: "01/03/1903", Email: "bucky@gmail.com", ImgSrc: "assets/images/user/8.jpg", IsSelected: true },
    { ClientId: "02", Nom: "Fury", Prenom: "Nick", DateNaissance: "02/12/1960", Email: "Nick@gmail.com", ImgSrc: "assets/images/user/1.jpg", IsSelected: false },
    { ClientId: "03", Nom: "Stark", Prenom: "Tony", DateNaissance: "05/08/1979", Email: "Tony@gmail.com", ImgSrc: "assets/images/user/14.png", IsSelected: false },
    { ClientId: "04", Nom: "Banner", Prenom: "Bruce", DateNaissance: "09/10/1975", Email: "Bruce@gmail.com", ImgSrc: "assets/images/user/5.jpg", IsSelected: false },
    { ClientId: "05", Nom: "Parker", Prenom: "Peter", DateNaissance: "13/07/1999", Email: "Peter@gmail.com", ImgSrc: "assets/images/avtar/11.jpg", IsSelected: false },
    { ClientId: "06", Nom: "Barton", Prenom: "Clint", DateNaissance: "24/06/1989", Email: "Clint@gmail.com", ImgSrc: "assets/images/avtar/16.jpg", IsSelected: false },
  ];

  constructor(private title: Title) {
    this.title.setTitle("Clients | CRM");
  }

  ngOnInit() {
  }

  showHistory() {
    this.history = !this.history;
  }

  OnClientSelected(id: string) {
    this.Clients = this.Clients.map((item) => {
      item.IsSelected = false;
      if (item.ClientId == id) {
        item.IsSelected = true;
        this.CurrentClient = item;
      }
      return item;
    })
  }

  DeleteClient(id: string) {
    this.CurrentClient = null;
    this.Clients = this.Clients.filter(x => x.ClientId != id);
  }

  OnSaveAddClient(newClientData) {
    console.log("OnSaveAddClient: ", newClientData)
    this.Clients.push(newClientData)
  }
}
