import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TableCuponsComponent } from './table-cupons.component';

describe('TableCuponsComponent', () => {
  let component: TableCuponsComponent;
  let fixture: ComponentFixture<TableCuponsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TableCuponsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TableCuponsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
