import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';  // Asume que tienes este servicio

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {

  constructor(private authService: AuthService, private router: Router) { }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {
    const expectedRole = route.data['role'];
    const currentUser = this.authService.getCurrentUser();

    if (!currentUser) {// Si el usuario no está autenticado, redirige al login
      this.router.navigate(['/login']);
      return false;
    }

    if (currentUser.role !== expectedRole) {// Si el rol no coincide con el esperado, redirige a la página del catálogo (o cualquier otra ruta)
      this.router.navigate(['/catalogo']);
      return false;
    }
    return true; // Permite el acceso si el rol coincide
  }
}
