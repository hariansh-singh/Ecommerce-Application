import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageProfilesAdminComponent } from './manage-profiles-admin.component';

describe('ManageProfilesAdminComponent', () => {
  let component: ManageProfilesAdminComponent;
  let fixture: ComponentFixture<ManageProfilesAdminComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManageProfilesAdminComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManageProfilesAdminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
