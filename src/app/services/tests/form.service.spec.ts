import { TestBed } from '@angular/core/testing';

import { Form } from '../form.service';
import { provideZonelessChangeDetection } from '@angular/core';

describe('Form', () => {
  let service: Form;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers:[
        provideZonelessChangeDetection()
      ]
    });
    service = TestBed.inject(Form);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
