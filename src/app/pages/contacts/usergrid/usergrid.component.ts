import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { Role } from './usergrid.model';
import { RolesService } from '../_services/roles.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-usergrid',
  templateUrl: './usergrid.component.html',
  styleUrls: ['./usergrid.component.scss']
})

/**
 * Contacts user grid component
 */
export class UsergridComponent implements OnInit {
  // bread crumb items
  breadCrumbItems: Array<{}>;

  rolesTable: Role[];
  selected;
  rolForm: FormGroup;
  permisionForm: FormGroup;
  submitted = false;
  items: FormArray;
  permissions;
  permissionsRole;
  editRol: boolean;
  roleSelected;
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
    })
    /**
     * fetches data
     */
    this._fetchData();
  }

  get form() {
    return this.rolForm.controls;
  }

  /**
   * Open modal
   * @param content modal content
   */
  openModal(content: any, edit?) {
    if (edit) {
      this.editRol = true;
      this.rolForm.get('name').setValue(edit.name);
      this.rolForm.get('id').setValue(edit.id);
      this.rolForm.get('description').setValue(edit.description);
      this.modalService.open(content);
    } else {
      this.editRol = false;
      this.modalService.open(content);
    }
  }

  addPermisionToRole(permission, i) {
    this._rolesService.addPermisionRole({
      role: this.roleSelected.id,
      permission: permission.id,
    }).subscribe(res => {
      console.log('agregado', res)
      this.roleSelected = res
      this.permissionsRole.splice(i, 1)
    })
  }
  openRolePermissionModale(content, data) {
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
      })
      this.roleSelected = data;
      this.modalService.open(content);
    });
  }

  getPermisions() {
    this._rolesService.getPermissions().subscribe(res => {
      this.permissions = res;
    });
  }
  /**
   * User grid data fetches
   */
  private _fetchData() {

    this._rolesService.getRoles().subscribe(res => {
      this.rolesTable = res;
    });
    this.getPermisions();
    // this.rolesTable = rolesTable;
  }

  /**
   * Save user
   */
  deletePermission(permission, i) {
    this._rolesService.deletePermission({
      role: this.roleSelected.id,
      permission: permission.id,
    }).subscribe(res => {
      this.roleSelected = res;
      this.permissionsRole.push(permission)
    })

  }
  saveRol() {
    if (this.rolForm.valid && !this.editRol) {
      this._rolesService.createRol(this.rolForm.getRawValue()).subscribe(res => {
        Swal.fire('Rol creado', '', 'success');
        this._fetchData();
        this.modalService.dismissAll()
        this.submitted = true;
        this.rolForm.reset();
      })
    } else {
      this._rolesService.updateRol(this.rolForm.getRawValue()).subscribe(res => {
        this.rolesTable.map((role, i) => {
          if (role.id == this.rolForm.get('id').value) {
            this.modalService.dismissAll();
            Swal.fire('Rol Actualizad', '', 'success');
            this.rolesTable[i] = res;
          }
        })
      })
    }
  }

  savePermisson() {
    if (this.permisionForm.valid) {
      this._rolesService.createPermission(this.permisionForm.getRawValue()).subscribe(res => {
        this.modalService.dismissAll();
        this.getPermisions();
        Swal.fire('Permiso creado', '', 'success');
      });
    }

  }
}