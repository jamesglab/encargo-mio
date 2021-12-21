import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CuponsRoutingModule } from './cupons-routing.module';
import { CuponsComponent } from './create-cupons/cupons.component';
import { TableCuponsComponent } from './components/table-cupons/table-cupons.component';
import { CreateCuponsComponent } from './components/create-cupons/create-cupons.component';
import { NgbDatepickerModule, NgbDropdownModule, NgbModalModule, NgbNavModule, NgbPaginationModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Ng2SearchPipeModule } from 'ng2-search-filter';
import { DropzoneModule } from 'ngx-dropzone-wrapper';
import { UIModule } from 'src/app/shared/ui/ui.module';
import { WidgetModule } from 'src/app/shared/widget/widget.module';
import { NgSelectModule } from '@ng-select/ng-select';
import { MatPaginatorModule } from '@angular/material/paginator';
import { UpdateCuponComponent } from './components/update-cupon/update-cupon.component';

@NgModule({
  declarations: [
    CuponsComponent,
    TableCuponsComponent,
    CreateCuponsComponent,
    UpdateCuponComponent
  ],
  imports: [
    CommonModule,
    CuponsRoutingModule,
    NgbNavModule,
    NgbModalModule,
    FormsModule,
    Ng2SearchPipeModule,
    NgbDropdownModule,
    DropzoneModule,
    ReactiveFormsModule,
    UIModule,
    WidgetModule,
    NgSelectModule,
    NgbPaginationModule,
    MatPaginatorModule,
    NgbDatepickerModule,

  ]
})
export class CuponsModule { }
