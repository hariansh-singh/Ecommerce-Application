import { TestBed } from '@angular/core/testing';

import { ManageProfilesService } from './manage-profiles.service';

describe('ManageProfilesService', () => {
  let service: ManageProfilesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ManageProfilesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
