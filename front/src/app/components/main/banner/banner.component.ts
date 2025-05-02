import { Component } from '@angular/core';
import {  CarouselModule } from 'ngx-bootstrap/carousel';


@Component({
  selector: 'app-banner',
  imports: [CarouselModule],
  templateUrl: './banner.component.html',
  styleUrl: './banner.component.css'
})
export class BannerComponent {

}
