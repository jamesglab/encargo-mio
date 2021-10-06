import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalEditLockersComponent } from './modal-edit-lockers.component';

describe('ModalEditLockersComponent', () => {
  let component: ModalEditLockersComponent;
  let fixture: ComponentFixture<ModalEditLockersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModalEditLockersComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalEditLockersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
