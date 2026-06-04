import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { 
  CContainer, 
  CRow, 
  CCol, 
  CCard, 
  CCardBody, 
  CButton, 
  CSpinner,
  CAlert
} from '@coreui/react';
import { CIcon } from '@coreui/icons-react';
import { cilCreditCard, cilCheckCircle, cilXCircle } from '@coreui/icons';
import { getApiUrl } from '../../utils/api';

const CheckoutForm = ({ setPreventEmptyRedirect }) => {
  const navigate = useNavigate();
  const { cartItems, getCartTotal, clearCart } = useCart();
  const { getAuthHeaders } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [orderInfo, setOrderInfo] = useState(null); // Guardará { clientSecret, orderId, subtotal, taxAmount, totalAmount }

  const cartSubtotal = getCartTotal();
  const displayedSubtotal = orderInfo ? orderInfo.subtotal : cartSubtotal;
  const displayedTax = orderInfo ? orderInfo.taxAmount : Number((cartSubtotal * 0.16).toFixed(2));
  const displayedTotal = orderInfo ? orderInfo.totalAmount : Number((displayedSubtotal + displayedTax).toFixed(2));

  // Paso 1: Iniciar el proceso de compra llamando al Backend al cargar la pantalla
  useEffect(() => {
    if (cartItems.length === 0) return;

    const startCheckout = async () => {
      setLoading(true);
      try {
        const response = await fetch(getApiUrl('/api/orders/checkout'), {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify({
            items: cartItems.map(item => ({
              product_id: item.id,
              quantity: item.quantity
            }))
          })
        });

        const data = await response.json();
        
        if (response.ok) {
          setOrderInfo(data); // { clientSecret, orderId, totalAmount }
        } else {
          setErrorMessage(data.error || 'Ocurrió un error al preparar el pago.');
        }
      } catch (err) {
        setErrorMessage('No se pudo conectar con el servidor para iniciar la transacción.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    startCheckout();
  }, [cartItems]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!orderInfo) {
      return;
    }

    setLoading(true);
    setErrorMessage('');

    try {
      const response = await fetch(getApiUrl('/api/orders/confirm'), {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          orderId: orderInfo.orderId,
          paymentIntentId: orderInfo.paymentIntentId || 'fake_payment',
          success: true
        })
      });

      const data = await response.json();

      if (response.ok) {
        setSuccessMessage('¡Pago simulado exitoso! Factura generada.');
        // Evitar que el efecto padre redirija inmediatamente cuando el carrito se vacíe
        if (setPreventEmptyRedirect) setPreventEmptyRedirect(true);
        // Esperar unos segundos para mostrar mensaje exitoso antes de limpiar y redirigir
        setTimeout(() => {
          clearCart();
          if (setPreventEmptyRedirect) setPreventEmptyRedirect(false);
          navigate('/mis-compras');
        }, 3000);
      } else {
        setErrorMessage(data.error || 'No se pudo simular el pago. Intenta de nuevo.');
      }
    } catch (confirmErr) {
      console.error('Error confirmando pago simulado:', confirmErr);
      setErrorMessage('Error de red al registrar tu orden. Por favor intenta más tarde.');
    } finally {
      setLoading(false);
    }
  };

  const formatCOP = (val) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(val);
  };

  return (
    <div>
      {errorMessage && (
        <CAlert color="danger" className="d-flex align-items-center gap-2">
          <CIcon icon={cilXCircle} size="lg" />
          <div>{errorMessage}</div>
        </CAlert>
      )}

      {successMessage && (
        <CAlert color="success" className="d-flex align-items-center gap-2 py-4">
          <CIcon icon={cilCheckCircle} size="custom-size" style={{ height: '40px' }} />
          <div>
            <h4 className="alert-heading fw-bold mb-1">¡Compra Exitosa!</h4>
            <p className="mb-0">{successMessage}</p>
            <p className="small text-muted mt-2">Redireccionando a tu historial de compras...</p>
          </div>
        </CAlert>
      )}

      {!successMessage && (
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <div className="text-secondary small d-block mb-2">Pago simulado</div>
            <div className="p-3 bg-dark rounded-3 text-white small">
              El pago se procesará en modo de prueba. No se usa Stripe en este flujo.
            </div>
          </div>

          <div className="glass-panel p-4 p-3 mb-4 bg-dark-secondary rounded-3">
        <h5 className="text-white fw-semibold mb-3">Resumen de Compra</h5>
        <div className="d-flex justify-content-between align-items-center mb-2">
          <span className="text-secondary">Subtotal</span>
          <span className="text-white fw-semibold">{formatCOP(displayedSubtotal)}</span>
        </div>
        <div className="d-flex justify-content-between align-items-center mb-2">
          <span className="text-secondary">IVA 16%</span>
          <span className="text-white fw-semibold">{formatCOP(displayedTax)}</span>
        </div>
        <div className="border-top border-secondary pt-3 d-flex justify-content-between align-items-center">
          <span className="text-white fw-bold">Total a pagar</span>
          <span className="text-white fw-bold fs-5">{formatCOP(displayedTotal)}</span>
        </div>
      </div>

      <div className="d-grid mt-4">
            <CButton 
              type="submit" 
              disabled={loading || !orderInfo} 
              className="btn-red py-3 fs-5 d-flex align-items-center justify-content-center gap-2"
            >
              {loading ? (
                <>
                  <CSpinner size="sm" className="me-2" /> Procesando pago...
                </>
              ) : (
                <>
                  <CIcon icon={cilCreditCard} /> Simular pago {formatCOP(displayedTotal)}
                </>
              )}
            </CButton>
          </div>
        </form>
      )}
    </div>
  );
};

const Checkout = () => {
  const { cartItems, getCartTotal } = useCart();
  const navigate = useNavigate();
  const [preventEmptyRedirect, setPreventEmptyRedirect] = useState(false);

  useEffect(() => {
    if (cartItems.length === 0 && !preventEmptyRedirect) {
      navigate('/');
    }
  }, [cartItems, preventEmptyRedirect]);

  const formatCOP = (val) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(val);
  };

  return (
    <CContainer className="py-4">
      <h2 className="fw-bold mb-4" style={{ color: 'var(--text-primary)' }}>Pago simulado - prueba de factura</h2>

      <CRow className="g-4">
        {/* Formulario de Pago */}
        <CCol lg={7}>
          <div className="glass-panel p-4 p-md-5 text-white">
            <h4 className="fw-bold mb-4 text-uppercase tracking-wide">Completar Pago</h4>
            <CheckoutForm setPreventEmptyRedirect={setPreventEmptyRedirect} />
          </div>
        </CCol>

        {/* Resumen Lateral */}
        <CCol lg={5}>
          <div className="glass-panel p-4 text-white">
            <h4 className="fw-bold mb-3 text-uppercase tracking-wide">Resumen del Pedido</h4>
            
            <div className="mb-4" style={{ maxHeight: '200px', overflowY: 'auto' }}>
              {cartItems.map((item) => (
                <div key={item.id} className="d-flex align-items-center justify-content-between py-2 border-bottom border-secondary">
                  <div className="d-flex align-items-center gap-2">
                    <img 
                      src={item.image_url} 
                      alt={item.name} 
                      width="35" 
                      height="35" 
                      className="rounded object-fit-cover" 
                    />
                    <span className="small text-truncate" style={{ maxWidth: '200px' }}>{item.name}</span>
                    <span className="text-muted small">x{item.quantity}</span>
                  </div>
                  <span className="small fw-semibold">{formatCOP(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>

            <div className="d-flex justify-content-between align-items-center">
              <span className="h5 text-secondary">Total a Pagar:</span>
              <span className="h3 text-white fw-extrabold">{formatCOP(getCartTotal())}</span>
            </div>
          </div>
        </CCol>
      </CRow>
    </CContainer>
  );
};

export default Checkout;
