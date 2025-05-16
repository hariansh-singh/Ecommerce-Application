import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FooterAdminComponent } from './footer-admin.component';

describe('FooterAdminComponent', () => {
  let component: FooterAdminComponent;
  let fixture: ComponentFixture<FooterAdminComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FooterAdminComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FooterAdminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
