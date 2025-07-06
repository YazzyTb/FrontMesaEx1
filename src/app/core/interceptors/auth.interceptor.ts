import { HttpInterceptorFn } from '@angular/common/http';

export const AuthInterceptor: HttpInterceptorFn = (req, next) => {
  if (typeof window !== 'undefined') {
    const token = sessionStorage.getItem('token');

    // Excluir Cloudinary y Login
    const isCloudinary = req.url.includes('api.cloudinary.com');
    const isLogin = req.url.includes('/login');

    if (isCloudinary || isLogin) {
      return next(req); // no modificar
    }

    if (token) {
      const cloned = req.clone({
        setHeaders: {
          Authorization: `token ${token}`,
        },
      });
      return next(cloned);
    }
  }

  return next(req);
};
