import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalLockerEntryComponent } from './modal-locker-entry.component';

describe('ModalLockerEntryComponent', () => {
  let component: ModalLockerEntryComponent;
  let fixture: ComponentFixture<ModalLockerEntryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModalLockerEntryComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalLockerEntryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
