import { TestBed } from '@angular/core/testing';

import { FormTemplate } from '../form-template.service';

describe('FormTemplate', () => {
  let service: FormTemplate;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FormTemplate);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
