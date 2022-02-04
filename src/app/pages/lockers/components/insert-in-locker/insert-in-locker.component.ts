import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-insert-in-locker',
  templateUrl: './insert-in-locker.component.html',
  styleUrls: ['./insert-in-locker.component.scss']
})

export class InsertInLockerComponent implements OnInit {

  public formInsertLocker: FormGroup;

  constructor(
    public _fb: FormBuilder
  ) { }

  ngOnInit(): void {
    this.formInsertLocker = this._fb.group({
      guide_number: [null, [Validators.required]],
      locker: [null, [Validators.required]],
      conveyor: [null, [Validators.required]],
      receipt_date: [null, [Validators.required]],
      reason: [null, [Validators.required]],
      items: this._fb.array([]),
    });
  }

  get form() {
    return this.formInsertLocker.controls;
  }

  addItem(): void {
    this.items().push(this.newItem());
  }

  newItem(): FormGroup {
    return this._fb.group({ item: null })
  }

  items(): FormArray {
    return this.formInsertLocker.get('items') as FormArray;
  }

  onSubmit(): void {
    this.addItem();
    if (this.formInsertLocker.valid) {

      return;
    }
  }

}