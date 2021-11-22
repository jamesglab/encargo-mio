import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LandingInitComponent } from './landing-init.component';

describe('LandingInitComponent', () => {
  let component: LandingInitComponent;
  let fixture: ComponentFixture<LandingInitComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LandingInitComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LandingInitComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
