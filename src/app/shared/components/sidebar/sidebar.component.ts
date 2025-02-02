import { Component, ViewEncapsulation, HostListener } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { Menu, NavService } from '../../services/nav.service';
import { LayoutService } from '../../services/layout.service';
import { environment } from 'src/environments/environment';
import { AuthService } from "src/app/shared/services/auth.service";


@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class SidebarComponent {
  public iconSidebar: boolean = false;
  public menuItems: Menu[] = [];
  public margin: number = 0; 
  public width: number = window.innerWidth;
  public leftArrowNone: boolean = true;
  public rightArrowNone: boolean = false;

  constructor(
    private router: Router,
    public navServices: NavService,
    public layout: LayoutService,
    private authService: AuthService
  ) {
    // Subscribe to menu items and handle route changes
    this.navServices.items.subscribe((menuItems) => {
      this.menuItems = menuItems;

      // Watch for navigation events
      this.router.events.subscribe((event) => {
        if (event instanceof NavigationEnd) {
          this.activateMenuByRoute(event.urlAfterRedirects);
        }
      });
    });

    // Load additional items if not in production
    if (!environment.production) {
      setTimeout(() => {
        this.navServices.otherItems.subscribe((menuItems) => {
          this.menuItems = this.menuItems.concat(menuItems);
        });
      }, 1000);
    }
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    // Adjust width on window resize
    this.width = event.target.innerWidth - 500;
  }

  // Helper to determine if margin should be applied
  shouldAddMargin(): boolean {
    const layouts = ['Rome', 'Singapore', 'Barcelona'];
    return layouts.includes(this.layout.config?.settings?.layout || '');
  }

  // Toggle the sidebar
  sidebarToggle() {
    this.navServices.collapseSidebar = !this.navServices.collapseSidebar;
    this.iconSidebar = !this.iconSidebar;
  }

  // Activate the menu item based on the current route
  activateMenuByRoute(url: string) {
    // Deactivate all items first
    this.menuItems.forEach((menuItem) => this.deactivateMenu(menuItem));

    // Find and activate the correct item
    this.menuItems.forEach((menuItem) => {
      if (menuItem.path && menuItem.path === url) {
        this.setNavActive(menuItem);
      }

      // Check children for active state
      if (menuItem.children) {
        menuItem.children.forEach((subItem) => {
          if (subItem.path && subItem.path === url) {
            this.setNavActive(subItem);
          }

          // Check deeper levels of children
          if (subItem.children) {
            subItem.children.forEach((subSubItem) => {
              if (subSubItem.path && subSubItem.path === url) {
                this.setNavActive(subSubItem);
              }
            });
          }
        });
      }
    });
  }

  // Set active menu item
  setNavActive(item: Menu) {
    item.active = true; // Activate the item

    // Activate parent items (if any)
    this.menuItems.forEach((menuItem) => {
      if (menuItem.children && menuItem.children.includes(item)) {
        menuItem.active = true;
      }
    });
  }

  // Check if a submenu is active based on the current route
  isSubmenuActive(menuItem: Menu): boolean {
    // Only check children if the menuItem has children
    if (menuItem.children) {
      return menuItem.children.some(
        (child) => child.path && this.router.url.includes(child.path)
      );
    }
    return false;
  }

  // Check if the current route matches a specific path
  isCurrentRoute(path: string): boolean {
    return this.router.url === path;
  }

  // Toggle submenu items
  toggleSubMenu(menuItem: Menu): void {
    // Close all submenus
    this.menuItems.forEach((item) => this.deactivateMenu(item));

    // Toggle the clicked submenu
    menuItem.active = !menuItem.active;
  }


  getSidebarClass(): string {
    return this.iconSidebar ? 'sidebar collapsed' : 'sidebar';
  }
  


  HandleLogOut():void{
    this.authService.Logout();
  }

  // Deactivate a menu item and its children
  deactivateMenu(item: Menu) {
    item.active = false; // Deactivate the item
    if (item.children) {
      item.children.forEach((subItem) => this.deactivateMenu(subItem));
    }
  }


  navigateTo(route: string) {
    this.router.navigate([route]);
  }

  // Scroll the horizontal menu to the left
  scrollToLeft() {
    if (this.margin >= -this.width) {
      this.margin = 0;
      this.leftArrowNone = true;
      this.rightArrowNone = false;
    } else {
      this.margin += this.width;
      this.rightArrowNone = false;
    }
  }

  // Scroll the horizontal menu to the right
  scrollToRight() {
    if (this.margin <= -3051) {
      this.margin = -3464;
      this.leftArrowNone = false;
      this.rightArrowNone = true;
    } else {
      this.margin -= this.width;
      this.leftArrowNone = false;
    }
  }
}
