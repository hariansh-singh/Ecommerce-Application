import { Routes } from '@angular/router';
import { MainComponent } from './components/main/main.component';
import { HomeComponent } from './components/main/home/home.component';
import { AboutComponent } from './components/main/about/about.component';
import { RegisterComponent } from './components/main/register/register.component';
import { AddProductComponent } from './components/seller-dashboard/add-product/add-product.component';
import { authGuard } from './guards/auth.guard';
import { LoginComponent } from './components/main/login/login.component';
import { EditProductComponent } from './components/seller-dashboard/edit-product/edit-product.component';
import { MyOrderDetailsComponent } from './components/main/my-order-details/my-order-details.component';
import { AllOrderDetailsComponent } from './components/seller-dashboard/all-order-details/all-order-details.component';
import { ViewCartComponent } from './components/main/view-cart/view-cart.component';
import { ProductdetailsComponent } from './components/main/productdetails/productdetails.component';
import { AdminDashboardComponent } from './components/admin-dashboard/admin-dashboard.component';
import { ManageProfilesAdminComponent } from './components/admin-dashboard/manage-profiles-admin/manage-profiles-admin.component';
import { HomeAdminComponent } from './components/admin-dashboard/home-admin/home-admin.component';
import { ShopComponent } from './components/main/shop/shop.component';
import { SellerDashboardComponent } from './components/seller-dashboard/seller-dashboard.component';
import { HomeSellerComponent } from './components/seller-dashboard/home-seller/home-seller.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },

  {
    path: '',
    component: MainComponent,
    children: [
      { path: '', component: HomeComponent },
      { path: 'about', component: AboutComponent },
      { path: 'myorders/:id', component: MyOrderDetailsComponent },
      { path: 'cart', component: ViewCartComponent },
      { path: 'product/:id', component: ProductdetailsComponent },
      { path: 'shop', component: ShopComponent },
    ],
  },

  {
    path: 'sellerdashboard',
    component: SellerDashboardComponent,
    children: [
      { path: '', component: HomeSellerComponent },
      { path: 'addProduct', component: AddProductComponent },
      { path: 'editpro/:id', component: EditProductComponent },
      { path: 'allorders', component: AllOrderDetailsComponent },
    ],
  },

  {
    path: 'admindashboard',
    component: AdminDashboardComponent,
    children: [
      { path: '', component: HomeAdminComponent },
      { path: 'manageprofile', component: ManageProfilesAdminComponent },
    ],
  },
];
