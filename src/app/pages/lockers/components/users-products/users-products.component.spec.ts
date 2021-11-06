import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UsersProductsComponent } from './users-products.component';

describe('UsersProductsComponent', () => {
  let component: UsersProductsComponent;
  let fixture: ComponentFixture<UsersProductsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UsersProductsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UsersProductsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
