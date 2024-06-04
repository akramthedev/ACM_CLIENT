import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-material-tab-color',
  templateUrl: './material-tab-color.component.html',
  styleUrls: ['./material-tab-color.component.scss']
})
export class MaterialTabColorComponent implements OnInit {

  @Input() color: any;

  constructor() { }

  ngOnInit(): void {
  }

}
