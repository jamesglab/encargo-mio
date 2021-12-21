import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Role } from './usergrid.model';
import { RolesService } from '../_services/roles.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-usersgrid',
  templateUrl: './usersgrid.component.html',
  styleUrls: ['./usersgrid.component.scss']
})

export class UsersgridComponent implements OnInit {

  public breadCrumbItems: Array<{}>;

  public rolesTable: Role[];

  public rolForm: FormGroup;
  public permisionForm: FormGroup;
  public items: FormArray;

  public permissions: any;
  public permissionsRole: any;
  public roleSelected: any;
  public selected: any;

  public editRol: boolean;
  public isLoading: boolean = false;
  public submitted: boolean = false;

  constructor(private modalService: NgbModal, private formBuilder: FormBuilder, private _rolesService: RolesService) { }

  ngOnInit() {
    this.breadCrumbItems = [{ label: 'Contacts' }, { label: 'Users Grid', active: true }];
    this.rolForm = this.formBuilder.group({
      id: [null],
      name: ['', [Validators.required]],
      description: ['', [Validators.required]]
    });
    this.permisionForm = this.formBuilder.group({
      value: [null, [Validators.required]],
      description: [null, [Validators.required]]
    });
    this._fetchData();
  }

  get form() {
    return this.rolForm.controls;
  }

  openModal(content: any, edit?: any) {
    if (edit) {
      this.editRol = true;
      this.rolForm.get('name').setValue(edit.name);
      this.rolForm.get('id').setValue(edit.id);
      this.rolForm.get('description').setValue(edit.description);
      this.modalService.open(content, { centered: true });
    } else {
      this.editRol = false;
      this.modalService.open(content, { centered: true });
    }
  }

  addPermisionToRole(permission: any, i: number) {
    this._rolesService.addPermisionRole({
      role: this.roleSelected.id,
      permission: permission.id,
    }).subscribe(res => {
      this.roleSelected = res
      this.permissionsRole.splice(i, 1)
    }, err => {
      throw err;
    });
  }

  openRolePermissionModale(content: any, data: any) {
    this.roleSelected = null;
    this.permissionsRole = [];
    this._rolesService.getRoleById(data.id).subscribe(res => {
      this.permissions.map(permission => {
        let found = false;
        res.permissions.map(p => {
          if (permission.id == p.id) { found = true; }
        });
        if (!found) {
          this.permissionsRole.push(permission);
        }
      });
      this.roleSelected = data;
      this.modalService.open(content, { centered: true });
    }, err => {
      throw err;
    });
  }

  getPermisions() {
    this._rolesService.getPermissions()
      .subscribe((res: any) => {
        this.permissions = res;
      }, err => {
        throw err;
      });
  }

  private _fetchData() {
    this._rolesService.getRoles()
      .subscribe((res: any) => {
        this.rolesTable = res;
      });
    this.getPermisions();
  }

  deletePermission(permission: any, i?: number) {
    this._rolesService.deletePermission({
      role: this.roleSelected.id,
      permission: permission.id,
    }).subscribe((res: any) => {
      this.roleSelected = res;
      this.permissionsRole.push(permission)
    }, err => {
      throw err;
    });
  }

  saveRol() {
    if (this.rolForm.valid && !this.editRol) {
      this._rolesService.createRol(this.rolForm.getRawValue())
        .subscribe((res: any) => {
          Swal.fire('Rol creado', '', 'success');
          this._fetchData();
          this.modalService.dismissAll()
          this.submitted = true;
          this.rolForm.reset();
        }, err => {
          throw err;
        });
    } else {
      this._rolesService.updateRol(this.rolForm.getRawValue())
        .subscribe((res: any) => {
          this.rolesTable.map((role, i) => {
            if (role.id == this.rolForm.get('id').value) {
              this.modalService.dismissAll();
              Swal.fire('Rol Actualizad', '', 'success');
              this.rolesTable[i] = res;
            }
          });
        }, err => {
          throw err;
        });
    }
  }

  savePermisson() {
    if (this.permisionForm.valid) {
      this.isLoading = true;
      this._rolesService.createPermission(this.permisionForm.getRawValue())
        .subscribe((res: any) => {
          this.isLoading = false;
          this.permisionForm.reset();
          this.modalService.dismissAll();
          this.getPermisions();
          Swal.fire('Permiso creado', '', 'success');
        }, err => {
          throw err;
        });
    }

  }

}
