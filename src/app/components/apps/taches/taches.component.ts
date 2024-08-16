import { Component, OnInit, AfterViewInit } from "@angular/core";
import { Title } from "@angular/platform-browser";
import * as data from "../../../shared/data/todo/todo";
import { ClientService } from "src/app/shared/services/client.service";
import { NgxSpinnerService } from "ngx-spinner";
import DataTables from "datatables.net";

const Months = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];

export interface Task {
  text: string;
  completed: boolean;
}

@Component({
  selector: "app-taches",
  templateUrl: "./taches.component.html",
  styleUrl: "./taches.component.scss",
})
export class TachesComponent implements OnInit {
  public d = new Date();
  public myDate = `${this.d.getDate()} ${Months[this.d.getMonth() - 1]?.slice(0, 3)}`;
  public text: string = "";
  public todos = data.task;
  public completed: boolean = false;
  public red_border: boolean = false;
  public visible: boolean = false;
  public isOpen: boolean = false;
  filter = "all"; // 'all', 'completed', 'pending', 'inProgress', 'trash'
  filteredTodos: any[] = [];
  public objToAdd: object = {
    text: "",
    client: "",
    objToAdd: "",
    Date: this.myDate,
    completed: "",
    badgeClass: "",
  };
  Clients: any[] = [];
  AllClientTaches: any[] = [];
  images = ["assets/images/user/2.png", "assets/images/user/user-dp.png", "assets/images/user/1.png", "assets/images/user/2.png", "assets/images/user/2.png", "assets/images/user/2.png", "assets/images/user/2.png"];

  constructor(private title: Title, private clientService: ClientService, private loader: NgxSpinnerService) {
    this.title.setTitle("Tâches | CRM");
  }
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

  getTasks() {
    this.loader.show();
    this.clientService.GetAllClientTaches().subscribe(
      (response) => {
        console.log("response getAllClientTaches: ", response);
        this.loader.hide();
        this.AllClientTaches = response;
        this.initializeDataTable();
      },
      (error) => {
        console.error("Error fetching allclienttaches: ", error);
        this.loader.hide();
      }
    );
  }
  // initializeDataTable() {
  //   setTimeout(() => {
  //     $("#example").DataTable(); // Initialize DataTables on your table
  //   }, 0);
  // }
  // initializeDataTable() {
  //   setTimeout(() => {
  //     if ($.fn.DataTable.isDataTable("#example")) {
  //       $("#example").DataTable().destroy(); // Destroy existing DataTable instance
  //     }
  //     $("#example").DataTable(); // Initialize DataTables on your table
  //   }, 0);
  // }
  initializeDataTable() {
    setTimeout(() => {
      // Détruire l'ancienne instance si elle existe
      if ($.fn.DataTable.isDataTable("#example")) {
        $("#example").DataTable().destroy();
      }

      // Initialiser DataTables avec les nouvelles données
      $("#example").DataTable({
        data: this.AllClientTaches,
        columns: [
          { data: "ClientNom", title: "Nom" },
          { data: "ClientPrenom", title: "Prenom" },
          { data: "TacheIntitule", title: "Tache" },
          { data: "Numero_Ordre", title: "Numero Ordre" },
          { data: "PrestationDesignation", title: "Prestation" },
          { data: "MissionDesignation", title: "Mission" },
          { data: "Status", title: "Status" },
          { data: "AgentNom", title: "Agent" },
        ],
      });
    }, 0);
  }
  ngOnInit() {
    this.getClients();
    this.getTasks();
    this.filteredTodos = this.todos;
  }
  // ngAfterViewInit() {
  //   // Initialize DataTables
  //   $("#example").DataTable();
  // }
  setFilter(status: string): void {
    this.filter = status;
    this.filterTodos();
  }

  filterTodos(): void {
    if (this.filter === "all") {
      this.filteredTodos = this.todos;
    } else if (this.filter === "completed") {
      this.filteredTodos = this.todos.filter((todo) => todo.completed);
    } else if (this.filter === "pending") {
      this.filteredTodos = this.todos.filter((todo) => !todo.completed && todo.priority === "En Attente");
    } else if (this.filter === "inProgress") {
      this.filteredTodos = this.todos.filter((todo) => todo.priority === "En cours");
    } else if (this.filter === "trash") {
      this.filteredTodos = this.todos.filter((todo) => todo.priority === "Corbeille");
    }
  }
  getFirstThreeChars(date: string): string {
    return date.substring(0, 3);
  }
  public addTask(text: any) {
    let someData = {
      text: text,
    };
    this.todos.push(text);
    this.filterTodos();
  }

  public taskCompleted(task: any) {
    task.completed = !task.completed;
    this.filterTodos();
  }

  public taskDeleted(index: any) {
    this.todos.splice(index, 1);
    this.filterTodos();
  }

  public markAllAction(action: any) {
    this.todos.filter((task) => {
      task.completed = action;
    });
    this.completed = action;
    this.filterTodos();
  }
  getCount(status: string): number {
    if (status === "completed") {
      return this.todos.filter((todo) => todo.completed).length;
    } else if (status === "pending") {
      return this.todos.filter((todo) => !todo.completed && todo.priority === "En Attente").length;
    } else if (status === "inProgress") {
      return this.todos.filter((todo) => todo.priority === "En cours").length;
    }
    return 0;
  }
}
