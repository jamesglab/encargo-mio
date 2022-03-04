import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InsertByGuideComponent } from './insert-by-guide.component';

describe('InsertByGuideComponent', () => {
  let component: InsertByGuideComponent;
  let fixture: ComponentFixture<InsertByGuideComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InsertByGuideComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(InsertByGuideComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
