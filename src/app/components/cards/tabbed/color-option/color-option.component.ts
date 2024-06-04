import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-color-option',
  templateUrl: './color-option.component.html',
  styleUrls: ['./color-option.component.scss']
})
export class ColorOptionComponent implements OnInit {

  @Input() color: any
  constructor() { }

  ngOnInit(): void {
  }

}
