import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalCreateShippingComponent } from './modal-create-shipping.component';

describe('ModalCreateShippingComponent', () => {
  let component: ModalCreateShippingComponent;
  let fixture: ComponentFixture<ModalCreateShippingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModalCreateShippingComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalCreateShippingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
