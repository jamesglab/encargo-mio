import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LockerUpdateComponent } from './locker-update.component';

describe('LockerUpdateComponent', () => {
  let component: LockerUpdateComponent;
  let fixture: ComponentFixture<LockerUpdateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LockerUpdateComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LockerUpdateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
