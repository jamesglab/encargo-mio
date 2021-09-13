import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalRegisterPurchaseComponent } from './modal-register-purchase.component';

describe('ModalRegisterPurchaseComponent', () => {
  let component: ModalRegisterPurchaseComponent;
  let fixture: ComponentFixture<ModalRegisterPurchaseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModalRegisterPurchaseComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalRegisterPurchaseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
