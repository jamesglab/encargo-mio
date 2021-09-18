import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateCuponsComponent } from './create-cupons.component';

describe('CreateCuponsComponent', () => {
  let component: CreateCuponsComponent;
  let fixture: ComponentFixture<CreateCuponsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CreateCuponsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateCuponsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
