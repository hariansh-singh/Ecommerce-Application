import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TopProductsChartComponent } from './top-products-chart.component';

describe('TopProductsChartComponent', () => {
  let component: TopProductsChartComponent;
  let fixture: ComponentFixture<TopProductsChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TopProductsChartComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TopProductsChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
