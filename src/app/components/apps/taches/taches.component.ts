import { Component, OnInit } from "@angular/core";
import { Title } from "@angular/platform-browser";
import * as data from "../../../shared/data/todo/todo";
import { ClientService } from "src/app/shared/services/client.service";
import { NgxSpinnerService } from "ngx-spinner";

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

  public objToAdd: object = {
    text: "",
    client: "",
    objToAdd: "",
    Date: this.myDate,
    completed: "",
    badgeClass: "",
  };
  Clients: any[] = [];
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

  ngOnInit() {
    this.getClients();
  }
  getFirstThreeChars(date: string): string {
    return date.substring(0, 3);
  }
  public addTask(text: any) {
    let someData = {
      text: text,
    };
    this.todos.push(text);
  }

  public taskCompleted(task: any) {
    task.completed = !task.completed;
  }

  public taskDeleted(index: any) {
    this.todos.splice(index, 1);
  }

  public markAllAction(action: any) {
    this.todos.filter((task) => {
      task.completed = action;
    });
    this.completed = action;
  }
}
