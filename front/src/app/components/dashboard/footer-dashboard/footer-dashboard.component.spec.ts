import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FooterDashboardComponent } from './footer-dashboard.component';

describe('FooterDashboardComponent', () => {
  let component: FooterDashboardComponent;
  let fixture: ComponentFixture<FooterDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FooterDashboardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FooterDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
