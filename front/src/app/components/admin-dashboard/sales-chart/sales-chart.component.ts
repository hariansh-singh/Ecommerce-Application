import { Component, Input, AfterViewInit } from '@angular/core';
import { Chart } from 'chart.js/auto';

@Component({
  selector: 'app-sales-chart',
  imports: [],
  templateUrl: './sales-chart.component.html',
  styleUrl: './sales-chart.component.css'
})
export class SalesChartComponent implements AfterViewInit {

  @Input() data!: { labels: string[], values: number[] };
 
  ngAfterViewInit() {
    new Chart('salesChart', {
      type: 'bar',
      data: {
        labels: this.data.labels,
        datasets: [{ label: 'Revenue', data: this.data.values, backgroundColor: 'blue' }]
      }
    });
  }
}
