import { TestBed } from '@angular/core/testing';

import { SellerDashboardService } from './seller-dashboard.service';

describe('SellerDashboardService', () => {
  let service: SellerDashboardService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SellerDashboardService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
