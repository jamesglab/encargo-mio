import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { Subscription } from "rxjs";
import { UserService } from "src/app/_services/users.service";
import { UpdateAddressComponent } from "./update-address/update-address.component";

@Component({
  selector: "app-addressess",
  templateUrl: "./addressess.component.html",
  styleUrls: ["./addressess.component.scss"],
})
export class AddressessComponent implements OnInit {
  //OBJECTS
  public user: any = null;
  //ARRAYS
  public addressess: any[] = [];
  private unsuscribe: Subscription[] = [];

  constructor(
    private route: ActivatedRoute,
    private userService: UserService,
    private modalService: NgbModal
  ) {}

  ngOnInit(): void {
    this.obtainAddress();
  }

  //OBTENEMOS LAS DIRECCIONES DE UN USUARIO
  obtainAddress(): void {
    try {
      //CREAMOS LA CONSULTA DE LAS DIRECCIONES POR EL ID DEL USUARIO
      const addressSubscr = this.userService
        .getAddressByUser({ id: this.route.snapshot.paramMap.get("id") })
        .subscribe(
          (res) => {
            //VALIDAMOS SI NO EXISTE UNA DIRECCION DEL USUARIO Y GENERAMOS EL ERROR
            if (!res.addressess[0]) {
              throw new Error("Usuario sin direcciones");
            }
            //AGREGAMOS LA INFORMACION DEL USUARIO QUE SE ENCUENTRA EN LA DIRECCION [0]
            this.user = res.addressess[0].user;
            //AGREGAMOS LAS DIRECCIONES
            this.addressess = res.addressess;
          },
          (err) => {
            throw err;
          }
        );
      //CREAMOS LA SUBSCRIPCION
      this.unsuscribe.push(addressSubscr);
    } catch (error) {
      //CACHING ERROR
      // console.error(error);
    }
  }

  modalUpdateAddress(address) {
    const modal = this.modalService.open(UpdateAddressComponent, {
      size: "lg",
      centered: true,
    });
    modal.componentInstance.address_to_update = address;
    modal.result.then((res) => {
      this.obtainAddress();
    });
  }

  //VALIDAMOS LA DESTRUCCION DEL COMPONENTE
  ngOnDestroy() {
    //RECORREMOS Y ELIMINAMOS LAS SUBSCRIPCIONES
    this.unsuscribe.forEach((sb) => sb.unsubscribe());
  }
}
