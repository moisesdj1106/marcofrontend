import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { 
  CNavbar, 
  CContainer, 
  CNavbarBrand, 
  CNavbarToggler, 
  CCollapse, 
  CNavbarNav, 
  CNavItem, 
  CNavLink, 
  CButton, 
  CBadge,
  CDropdown,
  CDropdownToggle,
  CDropdownMenu,
  CDropdownItem
} from '@coreui/react';
import { CIcon } from '@coreui/icons-react';
import { cilCart, cilAccountLogout, cilUser, cilSpeedometer, cilList, cilShieldAlt, cilMenu } from '@coreui/icons';



const Navbar = () => {
  const { isAuthenticated, isAdmin, user, logout } = useAuth();
  const { getCartItemCount } = useCart();
  const navigate = useNavigate();
  const [visible, setVisible] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <CNavbar expand="lg" className="modern-navbar sticky-top" colorScheme="dark">
      <CContainer className="px-3 px-lg-4">
        {/* Logo moderno y compacto */}
        <CNavbarBrand as={Link} to="/" className="d-flex align-items-center gap-2 me-4">
          <div className="logo-modern">
            <img 
              src="/logo.png" 
              alt="Antigravity Repuestos" 
              className="logo-img"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.parentNode.innerHTML = '<div class="logo-placeholder">AR</div>';
              }}
            />
          </div>
          <div className="brand-text d-flex flex-column">
            <span className="brand-name fw-bold">MOTOREPUESTOS LA 33</span>
            <span className="brand-subtitle">accesorios al mayor y detal</span>
          </div>
        </CNavbarBrand>

        {/* Botón para móviles */}
        <CNavbarToggler onClick={() => setVisible(!visible)} className="border-0">
          <CIcon icon={cilMenu} size="lg" />
        </CNavbarToggler>

        {/* Menú principal */}
        <CCollapse className="navbar-collapse" visible={visible}>
          <CNavbarNav className="mx-auto mb-2 mb-lg-0 align-items-center">
            <CNavItem>
              <CNavLink 
                as={Link} 
                to="/" 
                className={({ isActive }) => 
                  `nav-link-modern fw-semibold px-3 ${isActive ? 'active' : ''}`
                }
              >
                Inicio
              </CNavLink>
            </CNavItem>
            
            <CNavItem>
              <CNavLink 
                as={Link} 
                to="/" 
                className="nav-link-modern fw-semibold px-3"
                onClick={() => {
                  if (window.location.pathname === '/') {
                    document.getElementById('productos')?.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
              >
                Catálogo
              </CNavLink>
            </CNavItem>

            <CNavItem>
              <CNavLink 
                as={Link} 
                to="/nosotros" 
                className={({ isActive }) => 
                  `nav-link-modern fw-semibold px-3 ${isActive ? 'active' : ''}`
                }
              >
                Nosotros
              </CNavLink>
            </CNavItem>

            {isAuthenticated && !isAdmin && (
              <CNavItem>
                <CNavLink 
                  as={Link} 
                  to="/mis-compras" 
                  className={({ isActive }) => 
                    `nav-link-modern fw-semibold px-3 ${isActive ? 'active' : ''}`
                  }
                >
                  Mis Compras
                </CNavLink>
              </CNavItem>
            )}

            {isAuthenticated && isAdmin && (
              <CDropdown variant="nav-item" placement="bottom-end">
                <CDropdownToggle caret={false} className="nav-link-modern fw-semibold px-3 d-flex align-items-center">
                  Admin <CIcon icon={cilSpeedometer} className="ms-1" size="sm" />
                </CDropdownToggle>
                <CDropdownMenu>
                  <CDropdownItem as={Link} to="/admin/dashboard" className="dropdown-item-modern">
                    <CIcon icon={cilSpeedometer} className="me-2" /> Panel Reportes
                  </CDropdownItem>
                  <CDropdownItem as={Link} to="/admin/inventario" className="dropdown-item-modern">
                    <CIcon icon={cilList} className="me-2" /> Inventario
                  </CDropdownItem>
                  <CDropdownItem as={Link} to="/admin/auditoria" className="dropdown-item-modern">
                    <CIcon icon={cilShieldAlt} className="me-2" /> Auditoría
                  </CDropdownItem>
                </CDropdownMenu>
              </CDropdown>
            )}
          </CNavbarNav>

          {/* Acciones del usuario */}
          <div className="d-flex align-items-center gap-3">
            {/* Carrito */}
            {!isAdmin && (
              <Link to="/carrito" className="cart-icon position-relative">
                <CIcon icon={cilCart} size="lg" />
                {getCartItemCount() > 0 && (
                  <CBadge 
                    color="danger" 
                    shape="rounded-pill"
                    className="cart-badge"
                  >
                    {getCartItemCount()}
                  </CBadge>
                )}
              </Link>
            )}

            {/* Autenticación */}
            {isAuthenticated ? (
              <CDropdown 
                alignment="end" 
                className="user-dropdown"
                visible={userDropdownOpen}
                onShow={() => setUserDropdownOpen(true)}
                onHide={() => setUserDropdownOpen(false)}
              >
                <CDropdownToggle caret={false} className="user-toggle d-flex align-items-center gap-2">
                  <div className="user-avatar">
                    <CIcon icon={cilUser} />
                  </div>
                  <div className="d-none d-md-flex flex-column text-start">
                    <span className="user-name fw-semibold">{user?.name || 'Usuario'}</span>
                    <span className="user-role small">
                      {isAdmin ? 'Administrador' : 'Cliente'}
                    </span>
                  </div>
                </CDropdownToggle>
                <CDropdownMenu className="user-menu">
                  <CDropdownItem header className="user-info">
                    <div className="fw-bold">{user?.name || 'Usuario'}</div>
                    <div className="small text-secondary">{user?.email}</div>
                  </CDropdownItem>
                  <CDropdownItem divider />
                  <CDropdownItem as={Link} to="/mis-compras" className="dropdown-item-modern">
                    <CIcon icon={cilList} className="me-2" /> Mis Compras
                  </CDropdownItem>
                  <CDropdownItem divider />
                  <CDropdownItem onClick={handleLogout} className="dropdown-item-modern text-danger">
                    <CIcon icon={cilAccountLogout} className="me-2" /> Cerrar Sesión
                  </CDropdownItem>
                </CDropdownMenu>
              </CDropdown>
            ) : (
              <div className="auth-buttons d-flex align-items-center gap-2">
                <CButton 
                  as={Link} 
                  to="/login" 
                  color="link" 
                  className="login-btn text-white opacity-75 hover-opacity-100"
                >
                  Iniciar Sesión
                </CButton>
                <CButton 
                  as={Link} 
                  to="/registro" 
                  className="register-btn fw-semibold"
                >
                  Registrarse
                </CButton>
              </div>
            )}
          </div>
        </CCollapse>
      </CContainer>
    </CNavbar>
  );
};

export default Navbar;