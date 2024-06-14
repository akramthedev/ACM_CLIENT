import { Component, OnInit, ViewChild } from '@angular/core';
import { AddClientComponent } from "./modal/add-client/add-client.component";
import { AddCategoryComponent } from "./modal/add-category/add-category.component";
import { PrintContactComponent } from "./modal/print-contact/print-contact.component";
import { Title } from '@angular/platform-browser';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { ClientService } from 'src/app/shared/services/client.service';
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
  titre: String;
  Clients: any[] = [];



  constructor(
    private title: Title,
    private router: Router,
    private clientService: ClientService,
    private loader: NgxSpinnerService,
    private toastr: ToastrService,
  ) {
    this.title.setTitle("Clients | CRM");
    this.titre = this.title.getTitle();
  }


  ngOnInit() {
    this.getClients();
  }

  getClients() {
    this.loader.show();
    this.clientService.getClients()
      .subscribe((response) => {
        console.log("response getClients: ", response);
        this.loader.hide();
        this.Clients = response;
      }, (error) => {
        console.error('Error fetching clients: ', error);
        this.loader.hide();
      });
  }
  navigateToDetails() {
    this.router.navigate(['/clients/details']);
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

  // sweetAlertDelete(id: string) {
  //   const swalWithBootstrapButtons = Swal.mixin({
  //     customClass: {
  //       confirmButton: 'btn btn-danger',
  //       cancelButton: 'btn btn-light me-2'
  //     },
  //     buttonsStyling: false,
  //   })
  //   swalWithBootstrapButtons.fire({
  //     title: 'Tu es sûr ?',
  //     text: "Vous ne pourrez pas revenir en arrière !",
  //     //type: 'warning',
  //     showCancelButton: true,
  //     confirmButtonText: 'Supprimer',
  //     cancelButtonText: 'Annuler',
  //     reverseButtons: true
  //   }).then((result) => {
  //     if (result.value) {
  //       this.CurrentClient = null;
  //       this.Clients = this.Clients.filter(x => x.ClientId != id);
  //       swalWithBootstrapButtons.fire(
  //         'Supprimer !',
  //         'Le client est supprimé .',
  //         'success'
  //       )
  //     } else if (
  //       // Read more about handling dismissals
  //       result.dismiss === Swal.DismissReason.cancel
  //     ) {
  //       swalWithBootstrapButtons.fire(
  //         'Annuler',
  //         'Le client est safe :)',
  //         'error'
  //       )
  //     }
  //   })
  // }

  sweetAlertDelete(id: string) {
    const swalWithBootstrapButtons = Swal.mixin({
      customClass: {
        confirmButton: 'btn btn-danger',
        cancelButton: 'btn btn-light me-2'
      },
      buttonsStyling: false,
    });
    swalWithBootstrapButtons.fire({
      title: 'Tu es sûr ?',
      text: "Vous ne pourrez pas revenir en arrière !",
      showCancelButton: true,
      confirmButtonText: 'Supprimer',
      cancelButtonText: 'Annuler',
      reverseButtons: true
    }).then((result) => {
      if (result.value) {
        this.clientService.deleteClient(id)
          .subscribe(() => {
            this.CurrentClient = null;
            this.Clients = this.Clients.filter(x => x.ClientId != id);
            this.toastr.success("Client supprimé");
            // swalWithBootstrapButtons.fire('Supprimé !', 'Le client est supprimé.', 'success');
          }, error => {
            console.error('Error deleting client: ', error);
            this.toastr.error("Erreur de suppression du client");
            // swalWithBootstrapButtons.fire('Erreur', 'Erreur lors de la suppression du client.', 'error');
          });
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        // swalWithBootstrapButtons.fire('Annulé', 'Le client est en sécurité :)', 'error');
      }
    });
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
