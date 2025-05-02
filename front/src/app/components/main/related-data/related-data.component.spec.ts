import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RelatedDataComponent } from './related-data.component';

describe('RelatedDataComponent', () => {
  let component: RelatedDataComponent;
  let fixture: ComponentFixture<RelatedDataComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RelatedDataComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RelatedDataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
