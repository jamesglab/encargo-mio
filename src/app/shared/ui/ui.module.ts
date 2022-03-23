import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbCollapseModule, NgbDatepickerModule, NgbTimepickerModule, NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { PagetitleComponent } from './pagetitle/pagetitle.component';
import { TakePhotoComponent } from './take-photo/take-photo.component';
import { WebcamModule } from 'ngx-webcam';

@NgModule({
  declarations: [PagetitleComponent, TakePhotoComponent],
  imports: [
    CommonModule,
    FormsModule,
    NgbCollapseModule,
    NgbDatepickerModule,
    NgbTimepickerModule,
    NgbDropdownModule,
    WebcamModule
  ],
  exports: [PagetitleComponent, TakePhotoComponent]
})

export class UIModule { }
