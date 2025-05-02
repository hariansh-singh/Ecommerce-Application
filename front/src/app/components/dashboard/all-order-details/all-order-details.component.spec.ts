import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AllOrderDetailsComponent } from './all-order-details.component';

describe('AllOrderDetailsComponent', () => {
  let component: AllOrderDetailsComponent;
  let fixture: ComponentFixture<AllOrderDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AllOrderDetailsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AllOrderDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
