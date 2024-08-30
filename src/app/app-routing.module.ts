import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
// import { RegisterComponent } from './auth/register/register.component';
import { ContentComponent } from "./shared/components/layout/content/content.component";
import { FullComponent } from "./shared/components/layout/full/full.component";
import { full } from "./shared/routes/full.routes";
import { content } from "./shared/routes/routes";
import { TachesComponent } from './components/apps/taches/taches.component';
import { AdminGuard } from './shared/guard/admin.guard';
import { RegisterComponent } from './auth/register/register.component';

const routes: Routes = [
  { path: '', redirectTo: 'app/home', pathMatch: 'full' },

  // { path: 'auth/login', component: LoginComponent },
  // { path: 'auth/register', component: RegisterComponent },

  { path: 'app', component: ContentComponent,  children: content },
  { path: '', component: FullComponent, canActivate: [AdminGuard], children: full },
  { path: '**', redirectTo: '' },
];

@NgModule({
  imports: [[RouterModule.forRoot(routes, {
    anchorScrolling: 'enabled',
    scrollPositionRestoration: 'enabled',
    useHash: true,
  })],
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
