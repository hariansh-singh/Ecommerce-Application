import { Routes } from '@angular/router';
import { MainComponent } from './components/main/main.component';
import { HomeComponent } from './components/main/home/home.component';
import { AboutComponent } from './components/main/about/about.component';
import { RegisterComponent } from './components/main/register/register.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { HomeDashboardComponent } from './components/dashboard/home-dashboard/home-dashboard.component';
import { AddProductComponent } from './components/dashboard/add-product/add-product.component';
import { authGuard } from './guards/auth.guard';
import { LoginComponent } from './components/main/login/login.component';
import { EditProductComponent } from './components/dashboard/edit-product/edit-product.component';
import { MyOrderDetailsComponent } from './components/main/my-order-details/my-order-details.component';
import { AllOrderDetailsComponent } from './components/dashboard/all-order-details/all-order-details.component';
import { ViewCartComponent } from './components/main/view-cart/view-cart.component';

export const routes: Routes = [
    {path:'', component: MainComponent, children: [
      {path: '', component: HomeComponent},
      {path: 'about', component: AboutComponent},
      {path: 'login', component: LoginComponent},
      {path: 'register', component: RegisterComponent},
      {path: 'myorders/:email', component: MyOrderDetailsComponent},
      {path: 'cart', component: ViewCartComponent}
    ]},
    {path: 'dashboard', component: DashboardComponent, children: [
      {path: '', component: HomeDashboardComponent},
      {path: 'addProduct', component: AddProductComponent},
      {path: 'editpro/:id', component: EditProductComponent},
      {path: 'allorders', component: AllOrderDetailsComponent}
    ]}
  ];
  
