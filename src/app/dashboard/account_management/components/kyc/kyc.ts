import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { KycEntityComponent } from '../kyc-entity/kyc-entity';
import { UserData } from './../../../../auth/models/userModel';
import { KycIndividualComponent } from '../kyc-individual/kyc-individual';
import { PlatformBrowserService } from '../../../../shared/services/platform-browser.service';
import { LocalStorageService } from 'angular-web-storage';

@Component({
  selector: 'app-kyc',
  standalone: true,
  templateUrl: './kyc.html',
  styleUrls: ['./kyc.scss'],
  imports: [CommonModule, KycEntityComponent, KycIndividualComponent],
})
export class KycComponent {
  userData: UserData;
  pageLoader: boolean = true;

  private platform = inject(PlatformBrowserService);
  private LocalStorageService = inject(LocalStorageService);

  ngOnInit() {
    if (this.platform.isBrowser) {
      this.userData = this.LocalStorageService.get('userData');
      this.pageLoader = false;
    }
  }
}
