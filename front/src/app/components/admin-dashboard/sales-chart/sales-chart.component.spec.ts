import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SalesChartComponent } from './sales-chart.component';

describe('SalesChartComponent', () => {
  let component: SalesChartComponent;
  let fixture: ComponentFixture<SalesChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SalesChartComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SalesChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
