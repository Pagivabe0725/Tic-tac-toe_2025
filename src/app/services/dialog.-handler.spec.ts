import { TestBed } from '@angular/core/testing';
import { DialogHandler } from './dialog-handler'; 

describe('DialogHandler', () => {
  let service: DialogHandler;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DialogHandler);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
