import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { loadStripe } from '@stripe/stripe-js';
import { 
  Elements, 
  CardElement, 
  useStripe, 
  useElements 
} from '@stripe/react-stripe-js';
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

// Inicializar Stripe con la llave pública. Intentará leerla del .env o usará una llave de prueba genérica
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_51PTestKeyPlaceholder');

const CheckoutForm = () => {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const { cartItems, getCartTotal, clearCart } = useCart();
  const { getAuthHeaders } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [orderInfo, setOrderInfo] = useState(null); // Guardará { clientSecret, orderId }

  // Paso 1: Iniciar el proceso de compra llamando al Backend al cargar la pantalla
  useEffect(() => {
    if (cartItems.length === 0) return;

    const startCheckout = async () => {
      setLoading(true);
      try {
        const response = await fetch('http://localhost:4000/api/orders/checkout', {
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

    if (!stripe || !elements || !orderInfo) {
      return;
    }

    setLoading(true);
    setErrorMessage('');

    // Confirmar pago en Stripe con los datos de tarjeta ingresados de forma segura
    const cardElement = elements.getElement(CardElement);

    const { paymentIntent, error } = await stripe.confirmCardPayment(orderInfo.clientSecret, {
      payment_method: {
        card: cardElement,
      },
    });

    if (error) {
      // ❌ EL PAGO DE STRIPE FALLÓ (Ejemplo: Fondos insuficientes, tarjeta declinada, expirada, etc.)
      const reason = error.message;
      setErrorMessage(`El pago fue rechazado: ${reason}`);
      console.log('Pago rechazado por Stripe:', reason);

      // Notificar al backend del rechazo de la orden
      try {
        await fetch('http://localhost:4000/api/orders/confirm', {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify({
            orderId: orderInfo.orderId,
            paymentIntentId: error.payment_intent ? error.payment_intent.id : orderInfo.clientSecret.split('_secret')[0],
            success: false
          })
        });
      } catch (confirmErr) {
        console.error('Error enviando reporte de rechazo al backend:', confirmErr);
      }
      setLoading(false);
    } else {
      // ✅ EL PAGO FUE EXITOSO EN STRIPE
      if (paymentIntent.status === 'succeeded') {
        // Notificar al backend del éxito para confirmar la orden, descontar stock y generar auditoría
        try {
          const response = await fetch('http://localhost:4000/api/orders/confirm', {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({
              orderId: orderInfo.orderId,
              paymentIntentId: paymentIntent.id,
              success: true
            })
          });

          const data = await response.json();

          if (response.ok) {
            setSuccessMessage(`¡Transacción Aprobada! Referencia: ${paymentIntent.id}`);
            clearCart();
            setTimeout(() => {
              navigate('/mis-compras');
            }, 3000);
          } else {
            setErrorMessage(data.error || 'El pago fue cobrado en Stripe pero falló al confirmarse en inventario. Por favor contacte soporte.');
          }
        } catch (confirmErr) {
          setErrorMessage('Error de red al registrar tu orden pagada. Por favor no intentes pagar nuevamente.');
        } finally {
          setLoading(false);
        }
      }
    }
  };

  const formatCOP = (val) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(val);
  };

  // Opciones de estilo del campo de tarjeta
  const cardElementOptions = {
    style: {
      base: {
        color: '#f5f6f8',
        fontFamily: 'Inter, sans-serif',
        fontSmoothing: 'antialiased',
        fontSize: '16px',
        '::placeholder': {
          color: '#a0aec0',
        },
      },
      invalid: {
        color: '#fa755a',
        iconColor: '#fa755a',
      },
    },
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
            <label className="text-secondary small d-block mb-2">Ingresa los Datos de tu Tarjeta de Crédito:</label>
            <div className="StripeElement-container">
              <CardElement options={cardElementOptions} />
            </div>
            <p className="text-muted small mt-2">
              🔒 Tus datos se encriptan y procesan de forma 100% segura mediante Stripe.
            </p>
          </div>

          <div className="d-grid mt-4">
            <CButton 
              type="submit" 
              disabled={loading || !stripe || !orderInfo} 
              className="btn-red py-3 fs-5 d-flex align-items-center justify-content-center gap-2"
            >
              {loading ? (
                <>
                  <CSpinner size="sm" className="me-2" /> Procesando pago...
                </>
              ) : (
                <>
                  <CIcon icon={cilCreditCard} /> Pagar {orderInfo ? formatCOP(orderInfo.totalAmount) : formatCOP(getCartTotal())}
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

  useEffect(() => {
    if (cartItems.length === 0) {
      navigate('/');
    }
  }, [cartItems]);

  const formatCOP = (val) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(val);
  };

  return (
    <CContainer className="py-4">
      <h2 className="text-white fw-bold mb-4">Pasarela de Pagos Stripe</h2>

      <CRow className="g-4">
        {/* Formulario de Pago */}
        <CCol lg={7}>
          <div className="glass-panel p-4 p-md-5 text-white">
            <h4 className="fw-bold mb-4 text-uppercase tracking-wide">Completar Pago</h4>
            <Elements stripe={stripePromise}>
              <CheckoutForm />
            </Elements>
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
