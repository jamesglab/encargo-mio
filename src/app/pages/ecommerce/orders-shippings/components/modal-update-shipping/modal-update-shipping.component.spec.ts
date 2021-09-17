import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalUpdateShippingComponent } from './modal-update-shipping.component';

describe('ModalUpdateShippingComponent', () => {
  let component: ModalUpdateShippingComponent;
  let fixture: ComponentFixture<ModalUpdateShippingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModalUpdateShippingComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalUpdateShippingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
