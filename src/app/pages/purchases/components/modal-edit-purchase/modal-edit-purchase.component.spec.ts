import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalEditPurchaseComponent } from './modal-edit-purchase.component';

describe('ModalEditPurchaseComponent', () => {
  let component: ModalEditPurchaseComponent;
  let fixture: ComponentFixture<ModalEditPurchaseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModalEditPurchaseComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalEditPurchaseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
