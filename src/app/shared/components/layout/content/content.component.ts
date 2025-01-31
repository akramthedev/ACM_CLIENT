import { AfterViewInit, Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import * as feather from 'feather-icons';
import { LayoutService } from '../../../services/layout.service';
import { NavService } from '../../../services/nav.service';
import { fadeInAnimation } from '../../../data/router-animation/router-animation';

@Component({
  selector: 'app-content',
  templateUrl: './content.component.html',
  styleUrls: ['./content.component.scss'],
  animations: [fadeInAnimation]
})
export class ContentComponent implements OnInit, AfterViewInit {
  isSpecialPage: boolean = false; // Tracks if the URL is "/calendar" or "/clients"

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    public navServices: NavService,
    public layout: LayoutService,
    private changeRef: ChangeDetectorRef
  ) {
    this.route.queryParams.subscribe((params) => {
      this.layout.config.settings.layout = params.layout ? params.layout : this.layout.config.settings.layout;
    });
  
    // Check the URL on route changes
    this.router.events.subscribe(() => {
      const currentUrl = this.router.url;
      


      this.isSpecialPage =   
        currentUrl === '/' || currentUrl === '/clients';
    });
  }

  ngAfterViewInit() {
    this.changeRef.detectChanges();
    setTimeout(() => {
      feather.replace();
    });
  }

  public getRouterOutletState(outlet) {
    return outlet.isActivated ? outlet.activatedRoute : '';
  }




  

  get layoutClass() {
    switch (this.layout.config.settings.layout) {
      case 'Dubai':
        return 'compact-wrapper';
      case 'London':
        return 'only-body';
      case 'Seoul':
        return 'compact-wrapper modern-type';
      case 'LosAngeles':
        return this.navServices.horizontal ? 'horizontal-wrapper material-type' : 'compact-wrapper material-type';
      case 'Paris':
        return 'compact-wrapper dark-sidebar';
      case 'Tokyo':
        return 'compact-sidebar';
      case 'Madrid':
        return 'compact-wrapper color-sidebar';
      case 'Moscow':
        return 'compact-sidebar compact-small';
      case 'NewYork':
        return 'compact-wrapper box-layout';
      case 'Singapore':
        return this.navServices.horizontal ? 'horizontal-wrapper enterprice-type' : 'compact-wrapper enterprice-type';
      case 'Rome':
        return 'compact-sidebar compact-small material-icon';
      case 'Barcelona':
        return this.navServices.horizontal
          ? 'horizontal-wrapper enterprice-type advance-layout'
          : 'compact-wrapper enterprice-type advance-layout';
      case 'horizontal-wrapper':
        return this.navServices.horizontal ? 'horizontal-wrapper' : 'compact-wrapper';
      default:
        return 'compact-wrapper';
    }
  }

  ngOnInit() {}
}
