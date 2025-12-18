import { Component, Inject, inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../auth/services/auth.service';
import { TruncateTextDirective } from '../directives/text-trucate';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ToastrService } from 'ngx-toastr';
import { UserData } from '../auth/models/userModel';
import { AuthData } from '../auth/models/authModel';
import { PlatformBrowserService } from '../shared/services/platform-browser.service';
import { LocalStorageService } from 'angular-web-storage';

@Component({
  selector: 'app-',
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatMenuModule,
    MatButtonModule,
    MatIconModule,
    TruncateTextDirective,
    MatTooltipModule,
  ],
})
export class DashboardComponent {
  render: string = '';
  preView: string = '';
  activeComponent: string = 'getStarted';
  render2: string = 'getStarted';
  addSubadmin: string = '/icons/addSubadmin.svg';
  isExpanded: boolean = false;
  imageUrl: string = '';
  isMenubarExpanded: boolean = false;
  isDarkMode: boolean = true;
  menubarWidth: string = '50px';
  subMenubarWidth: string = '15%';
  business_img: string = 'assets/icons/business_img.svg';
  leftMargin: string = '0px';
  preventCollapse: boolean = false;
  preventExpand: boolean = false;
  menuStyles: { [key: string]: string } = {
    height: '100vh',
  };
  sectionStyles: { [key: string]: string } = {
    height: '100vh',
  };
  height: any = 50;

  isTxnDetailsActive: boolean = true;
  isOtherMenuActive: boolean = false;
  pageLoader: boolean = false;
  userData: UserData;

  //dependencies
  private authService = inject(AuthService);
  private snackBar = inject(MatSnackBar);
  private router = inject(Router);
  private platform = inject(PlatformBrowserService);
  private localStroageService = inject(LocalStorageService);

  constructor() {}

  ngOnInit() {
    if (this.platform.isBrowser) {
      this.getUserDetails();
    }
  }

  isParentActive(menuName: string) {
    switch (menuName) {
      case 'TXN-DETAILS':
        this.isTxnDetailsActive = false;
        this.isOtherMenuActive = true;
        break;
      default:
        this.isTxnDetailsActive = true;
        this.isOtherMenuActive = true;
    }
  }

  openMainMenuComponent(active: string) {
    this.openSubMenuComponent(active);
    this.collapseMenuBar('collapse');
  }

  openSubMenuComponent(active: string) {
    this.menubarWidth = '50px';
    this.leftMargin = '0%';
    this.activeComponent = active;
    this.preventExpand = true;
  }

  renderSubMenuBar(view: string) {
    this.menubarWidth = '50px';
    this.leftMargin = '0%';
    this.activeComponent = view;
    this.render = view;
    this.preView = view;
    this.preventExpand = true;
  }

  expandMenuBar(expand: string) {
    if (!this.preventExpand) {
      this.isMenubarExpanded = true;
      this.menubarWidth = '16%';
      if (expand == 'expandwithbutton') {
        this.leftMargin = '0%';
        this.preventCollapse = true;
      } else {
        this.render ? (this.leftMargin = '0%') : (this.leftMargin = '13%');
        this.subMenubarWidth = '15%';
      }
    } else {
      this.preventExpand = false;
    }
  }

  collapseMenuBar(collapse: string) {
    if (!this.preventCollapse) {
      this.isMenubarExpanded = false;
      this.menubarWidth = '50px';
      this.leftMargin = '0px';
      if (collapse == 'collapse') {
        setTimeout(() => (this.render = ''), 500);
        this.subMenubarWidth = '0%';
      }
    } else {
      this.preventCollapse = false;
    }
  }

  //get user UserProfile

  getUserDetails(): void {
    this.pageLoader = true;
    this.authService.getMerchantDetails().subscribe({
      next: (res: AuthData) => {
        this.pageLoader = false;
        this.userData = res.data;
        this.localStroageService.set("userData", this.userData);
        
      },
      error: (err: HttpErrorResponse) => {
        this.pageLoader = false;
        console.error(err.error);
        this.snackBar.open(err.error.message || 'Something went wrong!', 'close', {
          duration: 5000,
          panelClass: ['error-snackbar', 'snackbar-with-progress'],
          verticalPosition: 'top',
          horizontalPosition: 'end',
        });
      },
    });
  }

  onLogout() {
    this.authService.logout().subscribe({
      next: (res: any) => {
        this.router.navigate(['/']);
        this.snackBar.open(res.message, 'close', {
          duration: 5000,
          panelClass: ['success-snackbar', 'snackbar-with-progress'],
          verticalPosition: 'top',
          horizontalPosition: 'end',
        });
      },
      error: (err: HttpErrorResponse) => {
        console.error(err.error);
        this.snackBar.open(err.error.message || 'Something went wrong!', 'close', {
          duration: 5000,
          panelClass: ['error-snackbar', 'snackbar-with-progress'],
          verticalPosition: 'top',
          horizontalPosition: 'end',
        });
      },
    });
  }
}
