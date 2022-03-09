import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IncomeProductsComponent } from './income-products.component';

describe('IncomeProductsComponent', () => {
  let component: IncomeProductsComponent;
  let fixture: ComponentFixture<IncomeProductsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ IncomeProductsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(IncomeProductsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
