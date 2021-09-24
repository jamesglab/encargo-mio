import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FragmentProductsComponent } from './fragment-products.component';

describe('FragmentProductsComponent', () => {
  let component: FragmentProductsComponent;
  let fixture: ComponentFixture<FragmentProductsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FragmentProductsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FragmentProductsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
