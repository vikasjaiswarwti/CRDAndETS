// src/routes/guards/PublicRoute.tsx
// Unauthenticated users → render children (login page etc.)
// Authenticated users   → redirect to /dashboard (can't go back to login)

import { Navigate, Outlet } from 'react-router-dom'
import { useSelector } from 'react-redux'
import {
    selectIsAuthenticated,
    selectAuthLoading
} from '../../features/auth/slices/authSlice'


export const PublicRoute = () => {

    const isAuthenticated = useSelector(selectIsAuthenticated);
    const isAuthLoading = useSelector(selectAuthLoading);

    // Wait for BOTH Auth and Navigation to be ready
    if (isAuthLoading) {
        return <div>Loading...</div>;
    }

    if (isAuthenticated) {
        return <Navigate to="/dashboard" replace />;
    }

    return <Outlet />;

}