import { Component, OnInit, ViewChild, Renderer2 } from "@angular/core";
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
import { environment } from "src/environments/environment";
import { forkJoin, of } from "rxjs";
import { catchError, switchMap } from "rxjs/operators";
import { AuthService } from "src/app/shared/services/auth.service";
import { keycloakUser } from "src/app/shared/model/models.model";

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
  User: keycloakUser = null;

  constructor(private title: Title, private router: Router, private clientService: ClientService, private loader: NgxSpinnerService, private toastr: ToastrService, private renderer: Renderer2, private authService: AuthService) {
    this.title.setTitle("Clients | ACM");
    this.titre = this.title.getTitle();

    // this.authService.GetCurrentUser().then((user: any) => {
    //   this.User = user;
    //   if ((this.User.firstName == null || this.User.firstName == "") && (this.User.lastName == null || this.User.lastName == "")) this.User.FullName = this.User.email;
    //   else this.User.FullName = this.User.firstName + " " + this.User.lastName;
    // }); 
    this.authService.GetCurrentUser().then((user: any) => {
      this.User = user;
      // if ((this.User.firstName == null || this.User.firstName == "") && (this.User.lastName == null || this.User.lastName == "")) {
      //   this.User.FullName = this.User.email;
      // } else if (this.User.lastName == null || this.User.lastName == "") {
      //   this.User.FullName = this.User.firstName;
      // } else {
      //   this.User.FullName = this.User.firstName + " " + this.User.lastName;
      // }
      if (
        (this.User.firstName == null || this.User.firstName == "") &&
        (this.User.lastName == null || this.User.lastName == "")
      ) {
        this.User.FullName = this.User.email;
      } else
        this.User.FullName =
          (this.User.firstName != null &&
          this.User.firstName != "" &&
          this.User.firstName != "undefined"
            ? this.User.firstName
            : "") +
          " " +
          (this.User.lastName != null &&
          this.User.lastName != "" &&
          this.User.lastName != "undefined"
            ? this.User.lastName
            : "");
    });
  }
  triggerFileInput() {
    const fileInput = document.querySelector(".updateimg") as HTMLInputElement;
    fileInput.click();
  }

  onProfileImageChange(event: any) {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      const fileExtension = file.name.split(".").pop().toLowerCase();
      const allowedExtensions = ["jpg", "jpeg", "png"];
      const mimeType = file.type;

      // Check if the file is an image and has the allowed extension
      if (!allowedExtensions.includes(fileExtension) || !mimeType.startsWith("image/")) {
        this.toastr.error("Veuillez sélectionner un fichier image valide (jpg, jpeg, png).");
        return;
      }

      const formData = new FormData();
      formData.append("file", file, file.name);
      formData.append("ClientId", this.CurrentClient.ClientId);

      const clientId = this.CurrentClient.ClientId;
      const oldExtensions = ["jpg", "jpeg", "png"];

      // Créer une requête HTTP pour chaque extension
      const checkAndDeleteRequests = oldExtensions.map((ext) => {
        return this.clientService.checkImageExists(clientId, ext).pipe(
          switchMap((exists: boolean) => {
            if (exists) {
              return this.clientService.DeleteProfileImage(clientId, ext);
            } else {
              return of(null); // Si l'image n'existe pas, on continue
            }
          }),
          catchError((err) => {
            console.log(`Erreur lors de la suppression de l'image avec extension ${ext}:`, err);
            return of(null); // En cas d'erreur, continuer quand même
          })
        );
      });

      // Exécuter les suppressions en parallèle
      forkJoin(checkAndDeleteRequests).subscribe(() => {
        // Après avoir supprimé les anciennes images, uploader la nouvelle
        this.clientService.UploadProfileImage(formData).subscribe(
          (response: any) => {
            // Utilisez le chemin complet avec un timestamp pour forcer le rechargement de l'image
            const timestamp = new Date().getTime();
            const imageUrl = `${environment.url}/Pieces/${clientId}/profile.${fileExtension}?t=${timestamp}`;

            // Mettre à jour l'URL de l'image de profil
            this.CurrentClient.ImgSrc = imageUrl;
            console.log("Image mise à jour:", this.CurrentClient.ImgSrc);
            this.toastr.success("Image de profil mise à jour avec succès");
          },
          (error: any) => {
            this.toastr.error("Erreur lors de l'upload de l'image de profil");
          }
        );
      });
    }
  }

  ngOnInit() {
    this.getClients();
    this.LoadTous();
  }
  LoadTous() {
    const butonTous = document.getElementById("pills-personal-tab");
    if (butonTous) {
      butonTous.click();
      console.log("bouton cliqued");
    }
  }

  images = ["assets/images/user/2.png", "assets/images/user/user-dp.png", "assets/images/user/1.png", "assets/images/user/2.png", "assets/images/user/2.png", "assets/images/user/2.png", "assets/images/user/2.png"];

  getClients() {
    this.loader.show();
    this.clientService.getClients().subscribe(
      (response) => {
        console.log("response getClients: ", response);
        this.loader.hide();

        // Charger tous les clients
        this.Clients = response.map((client) => {
          if (client.Photo == null) client.ImgSrc = "assets/images/user/user.png";
          else client.ImgSrc = `${environment.url}/${client.Photo}`;

          return client;
        });


        if (this.Clients.length > 0) {
          this.CurrentClient = this.Clients[0];
        }
        
      },
      (error) => {
        console.error("Error fetching clients: ", error);
        this.loader.hide();
      }
    );
  }
  // Function to format Moroccan and French phone numbers
  formatPhoneNumber(phone: string): string {
    if (!phone) return "";

    // Check if the phone number starts with the Moroccan or French code
    if (phone.startsWith("+212")) {
      // Format for Moroccan numbers: +212 6 01 01 00 46
      return phone.replace(/^(\+212)(\d{1})(\d{2})(\d{2})(\d{2})(\d{2})$/, "$1 $2 $3 $4 $5 $6");
    } else if (phone.startsWith("+33")) {
      // Format for French numbers: +33 6 25 00 25 04
      return phone.replace(/^(\+33)(\d{1})(\d{2})(\d{2})(\d{2})(\d{2})$/, "$1 $2 $3 $4 $5 $6");
    }

    // Return the phone as-is if it doesn't match either format
    return phone;
  }
  // Unformat the phone number before saving to remove spaces (optional)
  unformatPhoneNumber(phone: string): string {
    return phone.replace(/\s/g, ""); // Remove all spaces
  }
  navigateToDetails(clientId: string) {
    this.router.navigate(["/clients/details/", clientId]);
  }
  showHistory() {
    this.history = !this.history;
  }

  OnClientSelected(id: string) {
    if (this.IsEditingClient) {
      this.toastr.warning("Veuillez compléter la modification");
      return;
    }

    this.Clients = this.Clients.map((item) => {
      item.IsSelected = false;
      if (item.ClientId === id) {
        item.IsSelected = true;
        this.CurrentClient = item;
      }
      return item;
    });
  }

  // Méthode pour vérifier l'existence de l'image sans générer d'erreur visible dans la console
  checkImageExists(url: string, callback: (exists: boolean) => void) {
    const img = new Image();

    // Si l'image est chargée avec succès
    img.onload = () => {
      callback(true); // L'image existe
    };

    // Si l'image échoue à charger (404 ou autre erreur)
    img.onerror = () => {
      callback(false); // L'image n'existe pas
    };

    // Désactiver la mise en cache pour éviter les erreurs dues à des images précédemment manquantes
    img.src = `${url}?t=${new Date().getTime()}`;
  }

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
    // Format phone numbers for display
    this.ClientToUpdate.Telephone1 = this.formatPhoneNumber(this.ClientToUpdate.Telephone1);
    this.ClientToUpdate.Telephone2 = this.formatPhoneNumber(this.ClientToUpdate.Telephone2);
    console.log("ClientToUpdate: ", this.ClientToUpdate);

    this.IsEditingClient = true;
  }
  SubmitUpdateClient() {
    if (this.ClientToUpdate.Nom == null || this.ClientToUpdate.Nom == "" || this.ClientToUpdate.Prenom == null || this.ClientToUpdate.Prenom == "") {
      this.toastr.warning("Veuillez saisir le nom et prénom du client.");
      return;
    }
    // Format phone numbers before saving
    this.ClientToUpdate.Telephone1 = this.formatPhoneNumber(this.ClientToUpdate.Telephone1);
    this.ClientToUpdate.Telephone2 = this.formatPhoneNumber(this.ClientToUpdate.Telephone2);
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
