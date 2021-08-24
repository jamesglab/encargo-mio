import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrdersBuysComponent } from './orders-buys.component';

describe('OrdersBuysComponent', () => {
  let component: OrdersBuysComponent;
  let fixture: ComponentFixture<OrdersBuysComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OrdersBuysComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OrdersBuysComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
