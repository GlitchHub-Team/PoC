import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HistoricChartComponent } from './historic-chart.component';

describe('HistoricChartComponent', () => {
  let component: HistoricChartComponent;
  let fixture: ComponentFixture<HistoricChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HistoricChartComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HistoricChartComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
