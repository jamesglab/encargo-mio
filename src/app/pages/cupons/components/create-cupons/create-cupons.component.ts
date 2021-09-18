import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NotifyService } from 'src/app/_services/notify.service';
import { CuponsService } from '../../services/cupons.service';

@Component({
  selector: 'app-create-cupons',
  templateUrl: './create-cupons.component.html',
  styleUrls: ['./create-cupons.component.scss']
})
export class CreateCuponsComponent implements OnInit {

  @Output() searchTransactions = new EventEmitter<any>()
  isLoading: boolean;
  createCuponsForm: FormGroup;
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
    this.createCuponsForm = this._formBuilder.group({
      price: [null, Validators.required],
      is_active: [null],
      date_init: [null, Validators.required],
      date_finish: [null, Validators.required],
      percentage: [null],
      availability: [null, Validators.required]
    });
  }


  createCupons() {
    if (this.createCuponsForm.valid){
      this.isLoading = true;
      const date_init = new Date(
        this.createCuponsForm.value.date_init.year,
        this.createCuponsForm.value.date_init.month,
        this.createCuponsForm.value.date_init.day
      )
      const date_finish = new Date(
        this.createCuponsForm.value.date_finish.year,
        this.createCuponsForm.value.date_finish.month,
        this.createCuponsForm.value.date_finish.day
      )
      this._cuponsService.createCupons({
        ...this.createCuponsForm.getRawValue(),
        date_init,
        date_finish
      }).subscribe(res => {
        this._notify.show('Codigo Creados', '', 'success');
        this.modalService.dismissAll();
        this.searchTransactions.emit(true)
      })
    }else{
      this._notify.show('Error','valida los campos del fomulario','error');
      this.isLoading = false;
    }
    
  }


}
