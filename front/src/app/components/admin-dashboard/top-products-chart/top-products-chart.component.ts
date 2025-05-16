import { Component, Input, AfterViewInit } from '@angular/core';
import { Chart } from 'chart.js/auto';
 
@Component({
  selector: 'app-top-products-chart',
  templateUrl: './top-products-chart.component.html',
  styleUrls: ['./top-products-chart.component.css']
})
export class TopProductsChartComponent implements AfterViewInit {
  @Input() data!: { labels: string[], values: number[] };
 
  ngAfterViewInit() {
    new Chart('topProductsChart', {
      type: 'bar',
      data: {
        labels: this.data.labels,
        datasets: [{ label: 'Total Sales', data: this.data.values, backgroundColor: 'orange' }]
      }
    });
  }
}