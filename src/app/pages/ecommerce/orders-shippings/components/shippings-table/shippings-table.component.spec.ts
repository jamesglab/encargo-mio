import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShippingsTableComponent } from './shippings-table.component';

describe('ShippingsTableComponent', () => {
  let component: ShippingsTableComponent;
  let fixture: ComponentFixture<ShippingsTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ShippingsTableComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ShippingsTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
