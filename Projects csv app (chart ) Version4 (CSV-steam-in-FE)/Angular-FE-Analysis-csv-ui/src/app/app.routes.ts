import { Routes } from '@angular/router';
import { AnalysisList } from './pages/analysis-list/analysis-list';
import { UnitList } from './pages/unit-list/unit-list';
import { Dashboard } from './pages/dashboard/dashboard';
import { ConfigureDashboard } from './pages/configure-dashboard/configure-dashboard';

export const routes: Routes = [

  { path: '', redirectTo: 'units', pathMatch: 'full' },

  { path: 'units', component: UnitList },

  { path: 'units/:unitId/analyses', component: AnalysisList },

  { path: 'analysis/:analysisId/configure', component: ConfigureDashboard },

  { path: 'analysis/:analysisId/dashboard', component: Dashboard }

];
// lady -loading dynamic components
