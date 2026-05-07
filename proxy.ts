import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function proxy(req) {
    // Check if user is trying to access admin routes
    if (req.nextUrl.pathname.startsWith('/admin') && 
        req.nextUrl.pathname !== '/admin/login') {
      
      // Check if user has admin role
      if (req.nextauth.token?.role !== 'admin') {
        return NextResponse.redirect(new URL('/admin/login', req.url));
      }
    }
    
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Allow access to login page without authentication
        if (req.nextUrl.pathname === '/admin/login') {
          return true;
        }
        
        // For admin routes, require authentication and admin role
        if (req.nextUrl.pathname.startsWith('/admin')) {
          return !!token && token.role === 'admin';
        }
        
        // Allow all other routes
        return true;
      },
    },
  }
);

export const config = {
  matcher: ['/admin/:path*']
};