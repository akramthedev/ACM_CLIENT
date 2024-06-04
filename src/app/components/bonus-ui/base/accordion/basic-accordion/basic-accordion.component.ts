import { Component } from '@angular/core';
import { simpleAccordionData } from '../../../../../shared/data/bonus-ui/accordian';

@Component({
  selector: 'app-basic-accordion',
  templateUrl: './basic-accordion.component.html',
  styleUrl: './basic-accordion.component.scss'
})

export class BasicAccordionComponent {

  public simpleAccordionData = simpleAccordionData ;

}
