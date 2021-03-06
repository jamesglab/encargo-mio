import { Component, Input, OnInit } from '@angular/core';
import { validateShippingstatus } from 'src/app/_helpers/tools/utils.tool';

@Component({
  selector: 'app-shipping-detail',
  templateUrl: './shipping-detail.component.html',
  styleUrls: ['./shipping-detail.component.scss']
})

export class ShippingDetailComponent implements OnInit {

  @Input() public shipping: any;

  constructor() { }

  ngOnInit(): void { }

  validateShippingstatus(status) {
    return validateShippingstatus(status)
  }
}
