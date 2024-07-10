import { Component, OnInit, ViewChild } from "@angular/core";
import { AddClientComponent } from "./modal/add-client/add-client.component";
import { AddCategoryComponent } from "./modal/add-category/add-category.component";
import { PrintContactComponent } from "./modal/print-contact/print-contact.component";
import { Title } from "@angular/platform-browser";
import Swal from "sweetalert2";
import { Router } from "@angular/router";
import { NgxSpinnerService } from "ngx-spinner";
import { ToastrService } from "ngx-toastr";
import { ClientService } from "src/app/shared/services/client.service";
import { Client } from "src/app/shared/model/dto.model";
@Component({
  selector: "app-clients",
  templateUrl: "./clients.component.html",
  styleUrls: ["./clients.component.scss"],
})
export class ClientsComponent implements OnInit {
  @ViewChild("addClient") AddClient: AddClientComponent;
  @ViewChild("addCategory") AddCategory: AddCategoryComponent;
  @ViewChild("print") Print: PrintContactComponent;

  public history: boolean = false;

  CurrentClient: any = null;
  titre: String;
  Clients: any[] = [];

  constructor(private title: Title, private router: Router, private clientService: ClientService, private loader: NgxSpinnerService, private toastr: ToastrService) {
    this.title.setTitle("Clients | CRM");
    this.titre = this.title.getTitle();
  }

  ngOnInit() {
    this.getClients();
  }

  images = ["assets/images/user/2.png", "assets/images/user/user-dp.png", "assets/images/user/1.png", "assets/images/user/2.png", "assets/images/user/2.png", "assets/images/user/2.png", "assets/images/user/2.png"];

  getClients() {
    this.loader.show();
    this.clientService.getClients().subscribe(
      (response) => {
        console.log("response getClients: ", response);
        this.loader.hide();
        let i = 0;
        this.Clients = response.map((item) => {
          if (this.images[i] != null) item.imgSrc = this.images[i];
          i++;
          return item;
        });
      },
      (error) => {
        console.error("Error fetching clients: ", error);
        this.loader.hide();
      }
    );
  }
  navigateToDetails(clientId: string) {
    this.router.navigate(["/clients/details/", clientId]);
  }
  showHistory() {
    this.history = !this.history;
  }

  OnClientSelected(id: string) {
    if (this.IsEditingClient == true) {
      this.toastr.warning("Veuillez completer la modification");
      return;
    }
    this.Clients = this.Clients.map((item) => {
      item.IsSelected = false;
      if (item.ClientId == id) {
        item.IsSelected = true;
        this.CurrentClient = item;
      }
      return item;
    });
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
        confirmButton: "btn btn-danger",
        cancelButton: "btn btn-light me-2",
      },
      buttonsStyling: false,
    });
    swalWithBootstrapButtons
      .fire({
        title: "Tu es sûr ?",
        text: "Vous ne pourrez pas revenir en arrière !",
        showCancelButton: true,
        confirmButtonText: "Supprimer",
        cancelButtonText: "Annuler",
        reverseButtons: true,
      })
      .then((result) => {
        if (result.value) {
          this.clientService.deleteClient(id).subscribe(
            () => {
              this.CurrentClient = null;
              this.Clients = this.Clients.filter((x) => x.ClientId != id);
              this.toastr.success("Client supprimé");
              // swalWithBootstrapButtons.fire('Supprimé !', 'Le client est supprimé.', 'success');
            },
            (error) => {
              console.error("Error deleting client: ", error);
              this.toastr.error("Erreur de suppression du client");
              // swalWithBootstrapButtons.fire('Erreur', 'Erreur lors de la suppression du client.', 'error');
            }
          );
        } else if (result.dismiss === Swal.DismissReason.cancel) {
          // swalWithBootstrapButtons.fire('Annulé', 'Le client est en sécurité :)', 'error');
        }
      });
  }

  DeleteClient(id: string) {
    this.CurrentClient = null;
    this.Clients = this.Clients.filter((x) => x.ClientId != id);
  }

  //#region UpdateClient
  public IsEditingClient: boolean = false;
  ClientToUpdate: Client = null;
  StartUpdateClient() {
    this.ClientToUpdate = structuredClone(this.CurrentClient);
    console.log("ClientToUpdate: ", this.ClientToUpdate);

    this.IsEditingClient = true;
  }
  SubmitUpdateClient() {
    if (this.ClientToUpdate.Nom == null || this.ClientToUpdate.Nom == "" || this.ClientToUpdate.Prenom == null || this.ClientToUpdate.Prenom == "") {
      this.toastr.warning("Veuillez saisir le nom et prénom du client.");
      return;
    }

    this.loader.show();
    this.clientService.UpdateClient(this.ClientToUpdate).subscribe(
      (response) => {
        console.log("response UpdateClient: ", response);
        this.loader.hide();

        if (response == null || response == false) {
          this.toastr.error("Erreur de modification du client");
        } else {
          this.toastr.success("Enregistrement réussi");

          this.CurrentClient = structuredClone(this.ClientToUpdate);
          this.Clients = this.Clients.map((item) => {
            if (item.ClientId == this.ClientToUpdate.ClientId) {
              item.Nom = this.ClientToUpdate.Nom;
              item.Prenom = this.ClientToUpdate.Prenom;
              item.Telephone1 = this.ClientToUpdate.Telephone1;
              item.Telephone2 = this.ClientToUpdate.Telephone2;
              item.Email1 = this.ClientToUpdate.Email1;
              item.Email2 = this.ClientToUpdate.Email2;
            }
            return item;
          });
          this.IsEditingClient = false;
          this.ClientToUpdate = null;
        }
      },
      (error: any) => {
        console.log("Error UpdateClient: ", error);
        this.toastr.error(`Erreur de modification du client. ${error?.error}`);
        this.loader.hide();
      }
    );
  }
  CancelUpdateClient() {
    this.IsEditingClient = false;
    this.ClientToUpdate = null;
  }
  //#endregion UpdateClient

  OnSaveAddClient(newClientData) {
    console.log("OnSaveAddClient: ", newClientData);
    this.Clients.push(newClientData);
  }
}
