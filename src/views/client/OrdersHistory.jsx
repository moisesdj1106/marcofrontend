import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  CContainer, 
  CCard, 
  CCardHeader, 
  CCardBody, 
  CBadge, 
  CSpinner,
  CRow,
  CCol
} from '@coreui/react';

const OrdersHistory = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { getAuthHeaders } = useAuth();

  useEffect(() => {
    fetchMyOrders();
  }, []);

  const fetchMyOrders = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/orders/my-orders', {
        headers: getAuthHeaders()
      });
      const data = await response.json();
      if (response.ok) {
        setOrders(data);
      }
    } catch (error) {
      console.error('Error al recuperar órdenes:', error);
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

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('es-CO', options);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed':
        return <CBadge color="success" className="badge-badge px-3 py-2">PAGADO (Stripe)</CBadge>;
      case 'rejected':
        return <CBadge color="danger" className="badge-badge px-3 py-2">RECHAZADO / FONDOS INSUFICIENTES</CBadge>;
      default:
        return <CBadge color="warning" className="badge-badge px-3 py-2">PENDIENTE</CBadge>;
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '70vh' }}>
        <CSpinner color="danger" variant="grow" />
      </div>
    );
  }

  return (
    <CContainer className="py-4">
      <h2 className="text-black fw-bold mb-4">Mis Compras</h2>

      {orders.length === 0 ? (
        <div className="text-center py-5 glass-panel">
          <h3 className="text-secondary mb-3">Aún no has realizado ninguna compra</h3>
          <p className="text-muted">Explora el catálogo de repuestos de MOTOREPUESTOS LA 33 y realiza tu primer pedido.</p>
        </div>
      ) : (
        <div className="d-flex flex-column gap-4">
          {orders.map((order) => (
            <CCard key={order.id} className="glass-panel border-0 text-white overflow-hidden">
              <CCardHeader className="p-3 d-flex flex-wrap justify-content-between align-items-center gap-2" style={{ backgroundColor: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <div>
                  <span className="text-muted small d-block">Número de Pedido:</span>
                  <span className="fw-bold">ORD-{order.id}</span>
                </div>
                <div>
                  <span className="text-muted small d-block">Fecha de Transacción:</span>
                  <span>{formatDate(order.created_at)}</span>
                </div>
                <div>
                  <span className="text-muted small d-block">Estado de Pago:</span>
                  {getStatusBadge(order.status)}
                </div>
                <div className="text-end">
                  <span className="text-muted small d-block">Total Cobrado:</span>
                  <span className="h5 mb-0 text-white fw-bold">{formatCOP(order.total_amount)}</span>
                </div>
              </CCardHeader>
              
              <CCardBody className="p-3">
                <h6 className="text-secondary text-uppercase small tracking-wide mb-3">Detalle de Repuestos</h6>
                {order.items && order.items.map((item, idx) => (
                  <div key={idx} className="d-flex align-items-center justify-content-between py-2 border-bottom border-secondary small">
                    <div className="d-flex align-items-center gap-3">
                      <img 
                        src={item.image_url || 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=400&q=80'} 
                        alt={item.product_name} 
                        width="40" 
                        height="40" 
                        className="rounded object-fit-cover" 
                      />
                      <div>
                        <span className="fw-semibold text-white d-block">{item.product_name}</span>
                        <span className="text-muted">Cantidad: {item.quantity} u.</span>
                      </div>
                    </div>
                    <div className="text-end">
                      <span className="text-white d-block">{formatCOP(item.unit_price * item.quantity)}</span>
                      <span className="text-muted small">{formatCOP(item.unit_price)} c/u</span>
                    </div>
                  </div>
                ))}
                
                {order.payment_intent_id && (
                  <div className="mt-3 text-muted small d-flex justify-content-between">
                    <span>ID de Transacción Stripe:</span>
                    <span className="font-monospace text-secondary">{order.payment_intent_id}</span>
                  </div>
                )}
              </CCardBody>
            </CCard>
          ))}
        </div>
      )}
    </CContainer>
  );
};

export default OrdersHistory;
