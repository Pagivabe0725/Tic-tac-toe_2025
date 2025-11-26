import { TestBed } from '@angular/core/testing';

import { SnackBarHandler } from '../snack-bar-handler.service'; 

describe('SnackBar', () => {
  let service: SnackBarHandler;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SnackBarHandler);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
