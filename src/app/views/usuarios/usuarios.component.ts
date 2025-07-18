import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { UserService } from '../../core/services/user.service';
import { RoleService } from '../../core/services/role.service';

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './usuarios.component.html',
  styleUrl: './usuarios.component.css'
})
export default class UsuariosComponent {

  isModalRegisterUserOpen: boolean = false;
  isModalUpdateUserOpen: boolean = false;

  // Datos del formulario de registro
  username: any;
  password: any;
  email: any;
  telefono: any;
  direccion: any;
  selectedRole: any = "";

  // Datos del formulario de actualización
  usernameUpdate: any;
  passwordUpdate: any;
  emailUpdate: any;
  telefonoUpdate: any;
  direccionUpdate: any;
  roleUpdate: any;
  userIdSelected: any;

  // Datos de usuario y roles
  users: Array<any> = [];
  roles: Array<any> = [];
  rolesMap: { [key: number]: string } = {};

  // Filtro
  rolSeleccionado: string = "";

  // Paginación
  paginaActual: number = 1;
  itemsPorPagina: number = 5;

  constructor(private userService: UserService, private roleService: RoleService) {
    this.getRoles();
    this.getUsers();
  }

  getRoles() {
    this.roleService.getRoles().subscribe({
      next: (resp: any) => {
        this.roles = resp;
        this.rolesMap = {};
        this.roles.forEach((rol: any) => {
          this.rolesMap[rol.id] = rol.nombre;
        });
      },
      error: (error: any) => console.log(error)
    });
  }

  getUsers() {
    this.userService.getUsers().subscribe({
      next: (resp: any) => this.users = resp,
      error: (error: any) => console.log(error)
    });
  }

  get usuariosFiltrados() {
    if (!this.rolSeleccionado) return this.users;
    return this.users.filter(user => user.rol == this.rolSeleccionado);
  }

  // Modal Registro
  activeRegisterForm() {
    this.isModalRegisterUserOpen = true;
  }

  closeRegisterUserModal() {
    this.isModalRegisterUserOpen = false;
  }

  registerUser() {
    const user = {
      nombre_completo: this.username,
      password: this.password,
      email: this.email,
      telefono: this.telefono,
      direccion: this.direccion,
      rol: this.selectedRole
    };

    this.userService.registerUser(user).subscribe({
      next: (resp: any) => {
        if (resp.id || resp.id >= 1) {
          this.getUsers();
          Swal.fire({ icon: 'success', title: 'Usuario registrado!', timer: 2000, showConfirmButton: false });
          this.closeRegisterUserModal();
        } else {
          Swal.fire({ icon: 'error', title: 'Error al registrar el usuario', timer: 2000, showConfirmButton: false });
        }
      },
      error: (error: any) => {
        console.log('Error al registrar usuario:', error);
        Swal.fire({ icon: 'error', title: 'Error al registrar el usuario', timer: 2000, showConfirmButton: false });
      }
    });
  }

  // Modal Update
  openModalToUpdateUser(user: any) {
    this.isModalUpdateUserOpen = true;
    this.userIdSelected = user.id;
    this.usernameUpdate = user.nombre_completo;
    this.passwordUpdate = '';
    this.emailUpdate = user.email;
    this.telefonoUpdate = user.telefono;
    this.direccionUpdate = user.direccion;
    this.roleUpdate = user.rol;
  }

  closeUpdateUserModal() {
    this.isModalUpdateUserOpen = false;
  }

  updateUser() {
    const userData = {
      nombre_completo: this.usernameUpdate,
      password: this.passwordUpdate,
      email: this.emailUpdate,
      telefono: this.telefonoUpdate,
      direccion: this.direccionUpdate,
      rol: this.roleUpdate
    };

    this.userService.updateUser(this.userIdSelected, userData).subscribe({
      next: (resp: any) => {
        this.getUsers();
        Swal.fire({ icon: 'success', title: 'Usuario actualizado!', timer: 2000, showConfirmButton: false });
        this.closeUpdateUserModal();
      },
      error: (error: any) => console.log(error)
    });
  }

  deleteUser(user: any) {
    this.userService.deleteUser(user.id).subscribe({
      next: (resp: any) => {
        this.getUsers();
        Swal.fire({ icon: 'success', title: 'Usuario eliminado!', timer: 2000, showConfirmButton: false });
      },
      error: (error: any) => console.log(error)
    });
  }

  updateRoleId(event: any) {
    this.roleUpdate = event;
  }
}
