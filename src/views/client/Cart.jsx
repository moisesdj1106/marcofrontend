import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { 
  CContainer, 
  CRow, 
  CCol, 
  CTable, 
  CTableHead, 
  CTableRow, 
  CTableHeaderCell, 
  CTableBody, 
  CTableDataCell, 
  CButton, 
  CCard, 
  CCardBody 
} from '@coreui/react';
import { CIcon } from '@coreui/icons-react';
import { cilTrash, cilArrowRight, cilCart } from '@coreui/icons';

const Cart = () => {
  const { cartItems, updateQuantity, removeFromCart, getCartTotal, clearCart } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const formatCOP = (val) => {
    return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'VES',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
    }).format(val);
  };

  const handleCheckout = () => {
    if (!isAuthenticated) {
      alert('Debes iniciar sesión para finalizar tu compra.');
      navigate('/login?redirect=checkout');
    } else {
      navigate('/checkout');
    }
  };

  if (cartItems.length === 0) {
    return (
      <CContainer className="py-5 text-center">
        <div className="glass-panel py-5 px-4 my-5">
          <CIcon icon={cilCart} size="custom-size" className="text-secondary mb-4" style={{ height: '80px' }} />
          <h2 className="text-black mb-2 font-bold">Tu carrito está vacío</h2>
          <p className="text-secondary mb-4">Aún no has agregado repuestos a tu compra.</p>
          <CButton as={Link} to="/" className="btn-red px-4 py-2">
            Ver Catálogo de Repuestos
          </CButton>
        </div>
      </CContainer>
    );
  }

  return (
    <CContainer className="py-4">
      <h2 className="fw-bold mb-4" style={{ color: 'var(--text-primary)' }}>Carrito de Compras</h2>
      
      <CRow className="g-4">
        {/* Tabla de Items */}
        <CCol lg={8}>
          <div className="glass-panel p-3 overflow-auto">
            <CTable align="middle" responsive borderless hover>
              <CTableHead>
                <CTableRow>
                  <CTableHeaderCell>Repuesto</CTableHeaderCell>
                  <CTableHeaderCell className="text-center">Precio</CTableHeaderCell>
                  <CTableHeaderCell className="text-center" style={{ width: '150px' }}>Cantidad</CTableHeaderCell>
                  <CTableHeaderCell className="text-end">Subtotal</CTableHeaderCell>
                  <CTableHeaderCell className="text-center"></CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {cartItems.map((item) => (
                  <CTableRow key={item.id} className="border-bottom border-secondary">
                    <CTableDataCell>
                      <div className="d-flex align-items-center gap-3">
                        <img 
                          src={item.image_url} 
                          alt={item.name} 
                          width="50" 
                          height="50" 
                          className="rounded object-fit-cover" 
                        />
                        <div>
                          <Link to={`/producto/${item.id}`} className="text-black text-decoration-none fw-semibold d-block">
                            {item.name}
                          </Link>
                          <span className="text-muted small">Ref: #{item.id}</span>
                        </div>
                      </div>
                    </CTableDataCell>
                    <CTableDataCell className="text-center text-black">
                      {formatCOP(item.price)}
                    </CTableDataCell>
                    <CTableDataCell className="text-center">
                      <div className="d-flex align-items-center justify-content-center border border-secondary rounded bg-dark" style={{ height: '35px' }}>
                        <button 
                          className="btn btn-dark btn-sm text-white px-2 py-0 border-0"
                          onClick={() => updateQuantity(item.id, item.quantity - 1, item.stock)}
                        >
                          -
                        </button>
                        <span className="px-2 text-black font-semibold" style={{ minWidth: '30px', textAlign: 'center' }}>
                          {item.quantity}
                        </span>
                        <button 
                          className="btn btn-dark btn-sm text-white px-2 py-0 border-0"
                          onClick={() => updateQuantity(item.id, item.quantity + 1, item.stock)}
                        >
                          +
                        </button>
                      </div>
                    </CTableDataCell>
                    <CTableDataCell className="text-end text-black fw-semibold">
                      {formatCOP(item.price * item.quantity)}
                    </CTableDataCell>
                    <CTableDataCell className="text-center">
                      <CButton 
                        color="link" 
                        onClick={() => removeFromCart(item.id)}
                        className="text-danger p-0"
                      >
                        <CIcon icon={cilTrash} size="lg" />
                      </CButton>
                    </CTableDataCell>
                  </CTableRow>
                ))}
              </CTableBody>
            </CTable>
            
            <div className="d-flex justify-content-between mt-3 px-2">
              <CButton 
                onClick={clearCart} 
                color="secondary" 
                className="btn-outline-red text-white py-2"
                style={{ border: '1px solid rgba(255,255,255,0.1)' }}
              >
                Vaciar Carrito
              </CButton>
              <CButton 
                as={Link} 
                to="/" 
                color="link" 
                className="text-white text-decoration-none d-flex align-items-center gap-1"
              >
                Seguir Comprando
              </CButton>
            </div>
          </div>
        </CCol>

        {/* Resumen del Pedido */}
        <CCol lg={4}>
          <CCard className="glass-panel border-0 text-black">
            <CCardBody className="p-4 d-flex flex-column gap-3">
              <h4 className="fw-bold border-bottom border-secondary pb-3 text-uppercase">Resumen de Compra</h4>
              
              <div className="d-flex justify-content-between">
                <span className="text-secondary">Productos:</span>
                <span>{cartItems.reduce((acc, item) => acc + item.quantity, 0)} u.</span>
              </div>
              
              <div className="d-flex justify-content-between">
                <span className="text-secondary">Envío:</span>
                <span className="text-success fw-bold">Gratuito</span>
              </div>
              
              <hr className="border-secondary my-1" />

              <div className="d-flex justify-content-between align-items-center py-2">
                <span className="h5 fw-bold mb-0">Total:</span>
                <span className="h3 text-black fw-extrabold mb-0">{formatCOP(getCartTotal())}</span>
              </div>

              <div className="mt-2 d-grid">
                <CButton onClick={handleCheckout} className="btn-red py-3 fs-5 d-flex align-items-center justify-content-center gap-2">
                  Proceder al Pago <CIcon icon={cilArrowRight} />
                </CButton>
              </div>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
    </CContainer>
  );
};

export default Cart;
