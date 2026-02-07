import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SensorWidgetComponent } from './sensor-widget.component';

describe('SensorWidgetComponent', () => {
  let component: SensorWidgetComponent;
  let fixture: ComponentFixture<SensorWidgetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SensorWidgetComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SensorWidgetComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
