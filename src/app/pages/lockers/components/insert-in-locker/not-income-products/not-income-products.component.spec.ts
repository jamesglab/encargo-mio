import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NotIncomeProductsComponent } from './not-income-products.component';

describe('NotIncomeProductsComponent', () => {
  let component: NotIncomeProductsComponent;
  let fixture: ComponentFixture<NotIncomeProductsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NotIncomeProductsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NotIncomeProductsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
