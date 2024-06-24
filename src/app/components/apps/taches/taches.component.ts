import { Component,OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import * as data from "../../../shared/data/todo/todo";

const Months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

export interface Task {
  text: string;
  completed: boolean;
}



@Component({
  selector: 'app-taches',
  templateUrl: './taches.component.html',
  styleUrl: './taches.component.scss'
})
export class TachesComponent implements OnInit {
  public d = new Date();
  public myDate = `${this.d.getDate()} ${Months[this.d.getMonth() - 1]?.slice(0, 3)}`;
  public text: string = "";
  public todos = data.task;
  public completed: boolean = false;
  public red_border: boolean = false;
  public visible: boolean = false;
  public isOpen : boolean = false;

  public objToAdd: object = {
    text: "",
    client:"",
    objToAdd: "",
    Date: this.myDate,
    completed: "",
    badgeClass: "",
  };

constructor(private title:Title){
  this.title.setTitle("Tâches | CRM");
}

ngOnInit() {
  
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
