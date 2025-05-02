import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderMainComponent } from './header-main/header-main.component';
import { FooterMainComponent } from './footer-main/footer-main.component';
import { HomeComponent } from './home/home.component';

@Component({
  selector: 'app-main',
  imports: [RouterOutlet, HeaderMainComponent, FooterMainComponent],
  templateUrl: './main.component.html',
  styleUrl: './main.component.css'
})
export class MainComponent {

}
