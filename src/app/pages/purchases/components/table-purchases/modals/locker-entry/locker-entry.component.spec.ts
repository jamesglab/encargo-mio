import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LockerEntryComponent } from './locker-entry.component';

describe('LockerEntryComponent', () => {
  let component: LockerEntryComponent;
  let fixture: ComponentFixture<LockerEntryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LockerEntryComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LockerEntryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
