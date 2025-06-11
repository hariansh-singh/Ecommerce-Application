import { TestBed } from '@angular/core/testing';

import { SellerDetailsService } from './seller-details.service';

describe('SellerDetailsService', () => {
  let service: SellerDetailsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SellerDetailsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
