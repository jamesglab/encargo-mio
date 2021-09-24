import { Component, OnInit, Input, Output, EventEmitter } from "@angular/core";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { NotifyService } from "src/app/_services/notify.service";

@Component({
  selector: "app-transaction",
  templateUrl: "./transaction.component.html",
  styleUrls: ["./transaction.component.scss"],
})

export class TransactionComponent implements OnInit {

  @Output() public refreshTable: EventEmitter<boolean> = new EventEmitter();
  @Input() public status: number;
  @Input() public transactions: Array<{
    id?: string;
    estimeted_value?: number;
    trm?: string;
    created_at?: string;
    updated_at?: string;
    is_shipping_locker?: boolean;
  }>;

  public orderSelected: any = {};
  public isLoading: boolean = false;
  public statusTab: number = 0;

  constructor(
    private modalService: NgbModal,
    public _notify: NotifyService
  ) { }

  ngOnInit() { }

  ngOnChanges() {
    this.statusTab = this.status;
  }

  openModal(order: any, modal: any, sizeModale: string) {
    this.modalService.open(modal, { size: sizeModale, centered: true });
    this.orderSelected = order;
  }

}
