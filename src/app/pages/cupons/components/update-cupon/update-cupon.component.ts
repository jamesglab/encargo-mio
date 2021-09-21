import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import * as moment from 'moment';
import { NotifyService } from 'src/app/_services/notify.service';
import { CuponsService } from '../../services/cupons.service';
@Component({
  selector: 'app-update-cupon',
  templateUrl: './update-cupon.component.html',
  styleUrls: ['./update-cupon.component.scss']
})
export class UpdateCuponComponent implements OnInit {
  @Input() cuponSelected;
  @Output() searchTransactions = new EventEmitter<any>()
  isLoading: boolean;
  updateCuponForm: FormGroup;
  constructor(
    private _formBuilder: FormBuilder,
    private _cuponsService: CuponsService,
    private _notify: NotifyService,
    public modalService: NgbModal,
  ) { }

  ngOnInit(): void {
    this.buildForm();
  }
  buildForm() {
    console.log('cupon',this.cuponSelected)
    this.updateCuponForm = this._formBuilder.group({
      id: [this.cuponSelected.id],
      price: [this.cuponSelected.price, Validators.required],
      is_active: [this.cuponSelected.is_active],
      date_init: [{
        year: parseInt(moment(this.cuponSelected.date_init).format('YYYY')),
        month: parseInt(moment(this.cuponSelected.date_init).format('M')),
        day: parseInt(moment(this.cuponSelected.date_init).format('D')),

      }, Validators.required],
      date_finish: [{
        year: parseInt(moment(this.cuponSelected.date_finish).format('YYYY')),
        month: parseInt(moment(this.cuponSelected.date_finish).format('M')),
        day: parseInt(moment(this.cuponSelected.date_finish).format('D')),
      }, Validators.required],
      percentage: [this.cuponSelected.percentage],
      availability: [this.cuponSelected.availability, Validators.required]
    });
  }


  updateCupons() {
    if (this.updateCuponForm.valid) {
      this.isLoading = true;
      const date_init = new Date(
        this.updateCuponForm.value.date_init.year,
        this.updateCuponForm.value.date_init.month,
        this.updateCuponForm.value.date_init.day
      )
      const date_finish = new Date(
        this.updateCuponForm.value.date_finish.year,
        this.updateCuponForm.value.date_finish.month,
        this.updateCuponForm.value.date_finish.day
      )
      this._cuponsService.updateCupons({
        ...this.updateCuponForm.getRawValue(),
        date_init,
        date_finish
      }).subscribe(res => {
        this._notify.show('Codigo Actualizo', '', 'success');
        this.modalService.dismissAll();
        this.searchTransactions.emit(true)
      })
    } else {
      this._notify.show('Error', 'valida los campos del fomulario', 'error');
      this.isLoading = false;
    }
  }

  closeModale(){
    this.modalService.dismissAll();
  }

}
