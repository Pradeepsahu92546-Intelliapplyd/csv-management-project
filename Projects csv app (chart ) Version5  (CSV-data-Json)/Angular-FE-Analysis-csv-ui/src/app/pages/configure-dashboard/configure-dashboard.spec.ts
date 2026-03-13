import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfigureDashboard } from './configure-dashboard';

describe('ConfigureDashboard', () => {
  let component: ConfigureDashboard;
  let fixture: ComponentFixture<ConfigureDashboard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConfigureDashboard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConfigureDashboard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
