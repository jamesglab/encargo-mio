import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FragmentRoutingModule } from './fragment-routing.module';
import { FragmentComponent } from './fragment.component';
import { NgbDatepickerModule, NgbDropdownModule, NgbModalModule, NgbNavModule, NgbPaginationModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Ng2SearchPipeModule } from 'ng2-search-filter';
import { UIModule } from 'src/app/shared/ui/ui.module';
import { WidgetModule } from 'src/app/shared/widget/widget.module';
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
import { NgxImageCompressService } from 'ngx-image-compress';
import { ImageDragDirective } from 'src/app/_directives/image-drag.directive';

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
    NgSelectModule,
    NgbPaginationModule,
    MatPaginatorModule,
    NgbDatepickerModule,
    DragDropModule
  ],
  exports : [
    ImageDragDirective
  ],
  providers: [
    {
      provide: DROPZONE_CONFIG,
      useValue: config
    },
    NgxImageCompressService
  ]
})
export class FragmentModule { }
