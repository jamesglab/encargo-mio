import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TablePurchasesComponent } from './table-purchases.component';

describe('TablePurchasesComponent', () => {
  let component: TablePurchasesComponent;
  let fixture: ComponentFixture<TablePurchasesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TablePurchasesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TablePurchasesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
