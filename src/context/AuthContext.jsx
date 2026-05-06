import React, { useState } from 'react';
import { AuthContext } from './authContextValue';
import { OBRAS, STATUS_LOTES } from '../constants/auth';

const DEFAULT_ADMIN = {
    id: 'admin-1',
    nome: 'Administrador',
    email: 'admin@valle.com',
    senha: 'admin123',
    role: 'admin',
    obrasPermitidas: OBRAS.map(o => o.codigo),
    statusPermitidos: STATUS_LOTES.map(s => s.value),
    createdAt: new Date().toISOString(),
};

export function AuthProvider({ children }) {
    const [currentUser] = useState(DEFAULT_ADMIN);
    const [users] = useState([DEFAULT_ADMIN]);
    const [loading] = useState(false);

    const login = () => ({ success: true, user: DEFAULT_ADMIN });
    const register = () => ({ success: true, message: 'Cadastro desativado' });
    const logout = () => { };
    const updateUserPermissions = () => ({ success: true });
    const deleteUser = () => ({ success: true });
    const approveUser = () => ({ success: true });

    const value = {
        currentUser,
        users,
        loading,
        login,
        register,
        logout,
        updateUserPermissions,
        deleteUser,
        approveUser,
        isAdmin: true,
        isAuthenticated: true,
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
}
