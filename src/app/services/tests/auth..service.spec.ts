import { TestBed } from '@angular/core/testing';

import { Auth } from '../auth.service';
import { provideZonelessChangeDetection } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';

describe('Auth', () => {
  let service: Auth;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientModule
      ],
      providers:[
        provideZonelessChangeDetection()
      ]
    });
    service = TestBed.inject(Auth);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
