import { Component } from '@angular/core';
import { HeaderSellerComponent } from './header-seller/header-seller.component';
import { FooterSellerComponent } from './footer-seller/footer-seller.component';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-seller-dashboard',
  imports: [RouterOutlet, HeaderSellerComponent, FooterSellerComponent],
  templateUrl: './seller-dashboard.component.html',
  styleUrl: './seller-dashboard.component.css'
})
export class SellerDashboardComponent {

}
