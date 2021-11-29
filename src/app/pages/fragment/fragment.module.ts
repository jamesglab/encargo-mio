import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FragmentRoutingModule } from './fragment-routing.module';
import { FragmentComponent } from './fragment.component';
import { NgbDatepickerModule, NgbDropdownModule, NgbModalModule, NgbNavModule, NgbPaginationModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Ng2SearchPipeModule } from 'ng2-search-filter';
import { UIModule } from 'src/app/shared/ui/ui.module';
import { WidgetModule } from 'src/app/shared/widget/widget.module';
import { Ng5SliderModule } from 'ng5-slider';
import { NgSelectModule } from '@ng-select/ng-select';
import { MatPaginatorModule } from '@angular/material/paginator';
import { ShippingDetailComponent } from './components/shipping-detail/shipping-detail.component';
import { FragmentProductsComponent } from './components/fragment-products/fragment-products.component';
import { DragDropModule } from '@angular/cdk/drag-drop';

/*IMAGES MODULE*/
import { DropzoneModule } from 'ngx-dropzone-wrapper';
import { NgxDropzoneModule } from 'ngx-dropzone';
import { DROPZONE_CONFIG } from 'ngx-dropzone-wrapper';
import { DropzoneConfigInterface } from 'ngx-dropzone-wrapper';

const config: DropzoneConfigInterface = {
  maxFilesize: 100,
};

@NgModule({
  declarations: [
    FragmentComponent,
    ShippingDetailComponent,
    FragmentProductsComponent
  ],
  imports: [
    CommonModule,
    FragmentRoutingModule,
    NgbNavModule,
    NgbModalModule,
    FormsModule,
    Ng2SearchPipeModule,
    NgbDropdownModule,
    DropzoneModule,
    NgxDropzoneModule,
    ReactiveFormsModule,
    UIModule,
    WidgetModule,
    Ng5SliderModule,
    NgSelectModule,
    NgbPaginationModule,
    MatPaginatorModule,
    NgbDatepickerModule,
    DragDropModule
  ],
  providers:[
    {
      provide: DROPZONE_CONFIG,
      useValue: config
    }
  ]
})
export class FragmentModule { }
