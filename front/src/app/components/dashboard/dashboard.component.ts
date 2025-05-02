import { Component } from '@angular/core';
import { HeaderDashboardComponent } from './header-dashboard/header-dashboard.component';
import { FooterDashboardComponent } from './footer-dashboard/footer-dashboard.component';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  imports: [RouterOutlet, HeaderDashboardComponent, FooterDashboardComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent {

}
