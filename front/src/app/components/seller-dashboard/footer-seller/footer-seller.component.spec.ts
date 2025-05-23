import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FooterSellerComponent } from './footer-seller.component';

describe('FooterDashboardComponent', () => {
  let component: FooterSellerComponent;
  let fixture: ComponentFixture<FooterSellerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FooterSellerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FooterSellerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
