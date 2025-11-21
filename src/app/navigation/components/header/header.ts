import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  templateUrl: './header.html',
  styleUrls: ['./header.scss'],
  imports: [CommonModule, RouterModule],
})
export class HeaderComponent {
  headerLogo: string = 'assets/icons/fynzon-full-logo.svg';
  token: boolean = false;
}
