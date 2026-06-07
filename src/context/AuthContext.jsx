import React, { createContext, useState, useEffect, useContext } from 'react';
import { getApiUrl } from '../utils/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [loading, setLoading] = useState(true);

  // Intentar cargar el perfil del usuario si hay un token al iniciar la app
  useEffect(() => {
    const fetchUser = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const response = await fetch(getApiUrl('/api/auth/me'), {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        // Si la respuesta no es ok, lanzar error
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        setUser(data.user);
      } catch (error) {
        console.error('Error al recuperar sesión:', error);
        // No hacemos logout automáticamente para permitir uso offline
        // El usuario podrá seguir viendo la página pero algunas funciones no estarán disponibles
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [token]);

  // Función para iniciar sesión
  const login = (userData, userToken) => {
    setToken(userToken);
    setUser(userData);
    localStorage.setItem('token', userToken);
  };

  // Función para registrarse
  const register = (userData, userToken) => {
    setToken(userToken);
    setUser(userData);
    localStorage.setItem('token', userToken);
  };

  // Cerrar sesión
  const logout = () => {
    setToken('');
    setUser(null);
    localStorage.removeItem('token');
    // Limpiar historial del mini chat al cerrar sesión
    try {
      localStorage.removeItem('miniChatMessages');
      // Emitir evento para componentes que deban reaccionar inmediatamente
      window.dispatchEvent(new Event('miniChatClear'));
    } catch (e) {
      console.warn('No se pudo limpiar miniChatMessages', e);
    }
  };

  // Helper para generar cabeceras de peticiones autenticadas
  const getAuthHeaders = () => {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  };

  const isAuthenticated = !!user;
  const isAdmin = user?.role === 'admin';

  const value = {
    user,
    token,
    loading,
    isAuthenticated,
    isAdmin,
    login,
    register,
    logout,
    getAuthHeaders
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
