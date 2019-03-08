import { TestBed } from '@angular/core/testing';

import { SerialPortService } from './serial-port.service';

describe('SerialPortService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: SerialPortService = TestBed.get(SerialPortService);
    expect(service).toBeTruthy();
  });
});
