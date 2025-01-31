import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { GalleryModule } from '@ks89/angular-modal-gallery';
import { NgbActiveModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { CarouselModule } from 'ngx-owl-carousel-o';
import { NgxPrintModule } from 'ngx-print';
import { SharedModule } from "../../../shared/shared.module";
import { ECommerceRoutingModule } from './e-commerce-routing.module';

import { CartComponent } from './cart/cart.component';
import { CheckOutComponent } from './checkout/checkout.component';
import { InvoiceComponent } from './invoice/invoice.component';
import { OrderHistoryComponent } from './order-history/order-history.component';
import { PaymentDetailsComponent } from './payment-details/payment-details.component';
import { PricingComponent } from './pricing/pricing.component';
import { ProductDetailsComponent } from './product-details/product-details.component';
import { ProductListComponent } from './product-list/product-list.component';
import { ProductComponent } from './product/product.component';
import { QuickViewComponent } from './quick-view/quick-view.component';
import { WishListComponent } from './wish-list/wish-list.component';

import 'hammerjs';
import 'mousetrap';

@NgModule({
    declarations: [
        OrderHistoryComponent,
        QuickViewComponent,
        CartComponent,
        WishListComponent,
        ProductListComponent,
        CheckOutComponent,
        InvoiceComponent,
        ProductComponent,
        ProductDetailsComponent,
        PaymentDetailsComponent,
        CheckOutComponent,
        InvoiceComponent,
        WishListComponent,
        QuickViewComponent,
        PricingComponent
    ],
    imports: [
        ECommerceRoutingModule,
        SharedModule,
        CommonModule,
        CarouselModule,
        NgbModule,
        HttpClientModule,
        FormsModule,
        ReactiveFormsModule,
        NgxPrintModule,
        GalleryModule
    ],
    providers: [NgbActiveModal]
})
export class ECommerceModule { }
