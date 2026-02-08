import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SensorChartComponent } from './sensor-chart.component';

describe('SensorChartComponent', () => {
  let component: SensorChartComponent;
  let fixture: ComponentFixture<SensorChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SensorChartComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SensorChartComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
