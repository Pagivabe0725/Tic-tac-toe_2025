import { TestBed } from '@angular/core/testing';

import { Functions } from '../functions.service';
import { provideZonelessChangeDetection } from '@angular/core';

describe('Functions', () => {
  let service: Functions;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers:[
        provideZonelessChangeDetection()
      ]
    });
    service = TestBed.inject(Functions);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
