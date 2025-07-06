import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
    providedIn: 'root'
})
export class AuthGuard implements CanActivate {

    constructor(private router: Router,
        @Inject(PLATFORM_ID) private platformId: any
    ) { }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
        if (isPlatformBrowser(this.platformId)) {
            const token = sessionStorage.getItem('token');
            console.log(token)
            if (token) {
                return true;
            } else {
                this.router.navigate(['/login']);
                return false;
            }
        } else {
            // Si se está ejecutando en el servidor, no hay token disponible
            return false;
        }
    }

}
