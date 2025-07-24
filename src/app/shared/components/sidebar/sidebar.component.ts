import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent implements OnInit {
  open = true;
  isClient = false; // Para identificar si es cliente (rol ID 1)
  isAdmin = false;  // Para identificar si es administrador
  userRole: string = '';

  constructor() {}

  ngOnInit() {
    this.checkUserRole();
  }

  toggleMenu() {
    this.open = !this.open;
  }

  checkUserRole() {
    const userStr = sessionStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      if (user && user.rol) {
        this.userRole = user.rol.nombre;
        this.isClient = user.rol.id === 1; // Cliente tiene rol ID 1
        this.isAdmin = user.rol.nombre === 'Administrador';
        
        console.log('Usuario actual:', user);
        console.log('Rol del usuario:', this.userRole);
        console.log('Es cliente:', this.isClient);
        console.log('Es admin:', this.isAdmin);
      }
    }
  }
}
