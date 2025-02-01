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
  isLoading: boolean = true;
  isLoading2: boolean = true;
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
    this.title.setTitle("Tâches | ACM");
  }
  getClients() {
    this.isLoading = true;

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
        setTimeout(() => {
          this.isLoading = false;
        }, 800);
      },
      (error) => {
        console.error("Error fetching clients: ", error);
        setTimeout(() => {
          this.isLoading = false;
        }, 800);
      }
    );
  }

  





  getTasks() {
    this.isLoading2 = true;
    this.clientService.GetAllClientTaches().subscribe(
      (response) => {
        console.warn("API Response:", response);
      
        // Process each task in the response
        this.AllClientTaches = response.map((task) => ({
          ClientTacheIntitule: task.ClientNom || task.ClientPrenom 
            ? `${task.ClientNom ?? ''} ${task.ClientPrenom ?? ''}`.trim() 
            : '---',
          TacheIntitule: task.TacheIntitule || '---',
          Numero_Ordre : task.Numero_Ordre, 
          PrestationDesignation: task.PrestationDesignation || '---',
          MissionDesignation: task.MissionDesignation || '---',
          AgentNom: task.AgentNom && task.AgentNom.trim() !== '' ? task.AgentNom : '---',  
          Status: task.IsDone === true || task.IsDone === 1 ? 'Finalisée' : 'En cours'
        }));
  
        console.log("Processed Tasks:", this.AllClientTaches);
  
        setTimeout(() => {
          this.isLoading2 = false;
        }, 800);
        this.initializeDataTable();
      },
      (error) => {
        console.error("Error fetching allclienttaches: ", error);
        setTimeout(()=>{
          this.isLoading2 = false;
        }, 800)
      }
    );
  }

  






  initializeDataTable() {
    setTimeout(() => {
      // Destroy the old instance if it exists
      if ($.fn.DataTable.isDataTable("#example")) {
        $("#example").DataTable().destroy();
      }
  
      // Initialize DataTables with new data
      const table = $("#example").DataTable({
        data: this.AllClientTaches,
        columns: [
          { data: "ClientTacheIntitule", title: "Nom et Prénom" },
          { data: "TacheIntitule", title: "Tache" },
          { data: "Numero_Ordre", title: "Numéro Ordre" },
          { data: "PrestationDesignation", title: "Prestation" },
          { data: "MissionDesignation", title: "Mission" },
          { data: "AgentNom", title: "Agent" },
          { data: "Status", title: "Statut" },
        ],
        // Rebuild the table after initialization
        drawCallback: () => {
          // Apply the finalisee-row class to rows where Status is "Finalisée"
          $('#example tbody tr').each(function() {
            const statusCell = $(this).find('td').last(); // Last column (Statut)
            if (statusCell.text().trim() === 'Finalisée') {
              $(this).addClass('finalisee-row');
            }
          });
        }
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