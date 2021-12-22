import { Component, OnInit } from "@angular/core";
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from "@angular/forms";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { Observable, Subscription } from "rxjs";
import { UserService } from "src/app/_services/users.service";
import Swal from "sweetalert2";
import { map, startWith } from "rxjs/operators";

@Component({
  selector: "app-update-address",
  templateUrl: "./update-address.component.html",
  styleUrls: ["./update-address.component.scss"],
})
export class UpdateAddressComponent implements OnInit {
  //OBJECTS
  public address_to_update = null;
  public update_address_form: FormGroup;

  //ARRAYS
  public filtered_citys: Observable<any>;
  public filtered_department: Observable<any>;

  public cities: any = [];
  public departaments: any = [];
  private unsuscribe: Subscription[] = [];

  //BOOLEANS
  public isLoader: boolean = false;

  constructor(
    private modal: NgbActiveModal,
    private fb: FormBuilder,
    private _userService: UserService
  ) {}

  ngOnInit(): void {
    this.buildForm();
    this.getDeparments();
  }

  //CREAMOS EL FOMULARIO
  buildForm() {
    this.update_address_form = this.fb.group({
      id: [this.address_to_update.id, [Validators.required]],
      user: [this.address_to_update.user.id],
      address: [
        this.address_to_update.address,
        [Validators.required, Validators.maxLength(80)],
      ],
      description: [this.address_to_update?.description],
      city: [
        { value: this.address_to_update?.city, disabled: true },
        [Validators.required],
      ],
      department: [this.address_to_update?.department, [Validators.required]],
      name: [this.address_to_update?.name, [Validators.required]],
      phone: [this.address_to_update?.phone, [Validators.required]],
      is_main: [this.address_to_update.is_main],
    });

    //BUSCAMOS LAS CIUDADES DEL DEPARTAMENTO GUARDADO
    this.getCities(this.address_to_update?.department?.id);

    //NOS SUBSCRIBIMOS A LOS CAMBIOS DE LOS INPUTS
    this.subscribeInputs();
  }

  //INICIO CONSULTAS AL API

  //ACTUALIZAREMOS LA DIRECCION
  updateAddress() {
    try {
      if (this.update_address_form.invalid) {
        throw new Error("Campos incompletos");
      }
      this.isLoader = true;
      this._userService
        .updateAddress({
          ...this.update_address_form.getRawValue(),
          department: this.update_address_form.value.department,
          city: this.update_address_form.value.city,
        })
        .subscribe(
          (res) => {
            this.modal.close(res);
            Swal.fire("Dirección actualizada", "", "success");
          },
          (err) => {
            throw err;
          }
        );
    } catch (error) {
      if (error.message) {
        Swal.fire(error.message, "", "error");
      }
    }
  }

  //BUSCAMOS LAS CIUDADES POR EL Id DEL DEPARTAMENTO
  getCities(id: string): void {
    const cities_subscription = this._userService
      .getCitiesByDepartment(id)
      .subscribe(
        (res: any) => {
          //VALIDAMOS QUE EXISTAN CIUDADES
          if (res.length > 0) {
            //HABILITAMOS EL CONTROLADOR DE LA CIUDAD
            this.update_address_form.get("city").enable();
            //AGREGAMOS LAS CIUDADES
            this.cities = res;
          }
        },
        (err) => {
          throw err;
        }
      );
    //AGREGAMOS LA SUBSCRIBCION
    this.unsuscribe.push(cities_subscription);
  }

  //CONSULTAMOS LOS DEPARTAMENTOS
  getDeparments() {
    const deparments_subscriptions = this._userService
      .getDepartments()
      .subscribe(
        (res) => {
          //AGREGAMOS LOS DEPARTAMENTOS
          this.departaments = res;
        },
        (err) => {
          throw err;
        }
      );
    //AGREGAMOS LA SUBSCRIBCION
    this.unsuscribe.push(deparments_subscriptions);
  }

  //FINCONSULTAS AL API

  //INICIO TOOLS

  //METODO PARA CERRAR EL MODAL
  closeModal() {
    this.modal.close();
  }

  //METODO PARA ABRIR LAS SUBSCRIBCIONES DE LOS INPUTS
  subscribeInputs() {
    //NOS SUBSCRIBIMOS A LOS CAMBIOS DEL DEPARTAMENTO QUE SELECCIONE EL USUARIO
    this.update_address_form.controls.department.valueChanges.subscribe(
      (dep: any) => {
        //VALIDAMOS LA SELECCION Y BUSCAMOS LOS DEPARTAMENTOS
        if (typeof dep == "object") {
          this.getCities(dep.id);
        }
      }
    );

    this.filtered_department = this.update_address_form
      .get("department")
      .valueChanges.pipe(
        startWith(""),
        map((value) => this._filter(value, "departaments"))
      );

    this.filtered_citys = this.update_address_form
      .get("city")
      .valueChanges.pipe(
        startWith(""),
        map((value) => this._filter(value, "cities"))
      );
  }

  display_city(city): string {
    return city ? city.name : "";
  }

  display_departament(departament) {
    return departament ? departament.name : "";
  }

  _filter(value: string, array: any): string[] {
    const filterValue = this._normalizeValue(value);
    let fileterdData = this[array].filter((option) =>
      this._normalizeValue(option).includes(filterValue)
    );
    if (fileterdData.length > 0) {
      return fileterdData;
    } else {
      return this[array];
    }
  }

  private _normalizeValue(value: any): string {
    if (typeof value === "object") {
      return value?.name.toLowerCase().replace(/\s/g, "");
    } else {
      return value.toLowerCase().replace(/\s/g, "");
    }
  }
  //VALIDAMOS LA DESTRUCCION DEL COMPONENTE
  ngOnDestroy() {
    //RECORREMOS Y ELIMINAMOS LAS SUBSCRIPCIONES
    this.unsuscribe.forEach((sb) => sb.unsubscribe());
  }
  //FIN TOOLS
}
