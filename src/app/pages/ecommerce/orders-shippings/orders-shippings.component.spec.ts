import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrdersShippingsComponent } from './orders-shippings.component';

describe('OrdersShippingsComponent', () => {
  let component: OrdersShippingsComponent;
  let fixture: ComponentFixture<OrdersShippingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OrdersShippingsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OrdersShippingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
