import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DynamicSingleContainerComponent } from './dynamic-single-container.component';

describe('DynamicSingleContainerComponent', () => {
  let component: DynamicSingleContainerComponent;
  let fixture: ComponentFixture<DynamicSingleContainerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DynamicSingleContainerComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DynamicSingleContainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
