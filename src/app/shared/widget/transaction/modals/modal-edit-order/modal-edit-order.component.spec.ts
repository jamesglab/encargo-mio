import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalEditOrderComponent } from './modal-edit-order.component';

describe('ModalEditOrderComponent', () => {
  let component: ModalEditOrderComponent;
  let fixture: ComponentFixture<ModalEditOrderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModalEditOrderComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalEditOrderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
