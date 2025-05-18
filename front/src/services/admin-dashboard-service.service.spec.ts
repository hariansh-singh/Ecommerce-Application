import { TestBed } from '@angular/core/testing';

import { AdminDashboardServiceService } from './admin-dashboard-service.service';

describe('AdminDashboardServiceService', () => {
  let service: AdminDashboardServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AdminDashboardServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
