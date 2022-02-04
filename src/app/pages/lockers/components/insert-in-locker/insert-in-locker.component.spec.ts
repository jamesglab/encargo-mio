import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InsertInLockerComponent } from './insert-in-locker.component';

describe('InsertInLockerComponent', () => {
  let component: InsertInLockerComponent;
  let fixture: ComponentFixture<InsertInLockerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InsertInLockerComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(InsertInLockerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
