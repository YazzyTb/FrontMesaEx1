import { TestBed } from '@angular/core/testing';

import { DetalleCarritoService } from './detalle-carrito.service';

describe('DetalleCarritoService', () => {
  let service: DetalleCarritoService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DetalleCarritoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
