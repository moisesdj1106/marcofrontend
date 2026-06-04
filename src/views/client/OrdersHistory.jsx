import React, { useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import { useAuth } from '../../context/AuthContext';
import { getApiUrl } from '../../utils/api';
import { 
  CContainer, 
  CCard, 
  CCardHeader, 
  CCardBody, 
  CBadge, 
  CSpinner,
  CRow,
  CCol,
  CButton
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
      const response = await fetch(getApiUrl('/api/orders/my-orders'), {
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
    currency: 'VES',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
    }).format(val);
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('es-CO', options);
  };

  const generateInvoicePdf = async (order) => {
    const doc = new jsPDF('p', 'pt', 'a4');
    const invoiceNumber = `ORD-${order.id}`;
    const date = formatDate(order.created_at);
    const customerName = order.billing_name || order.user_name;
    const customerEmail = order.billing_email || order.user_email;

    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 40;

    // Intentar cargar logo desde /logo.png en public
    let logoDataUrl = null;
    try {
      const resp = await fetch('/logo.png');
      if (resp.ok) {
        const blob = await resp.blob();
        logoDataUrl = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.readAsDataURL(blob);
        });
      }
    } catch (e) {
      // no pasa nada si falla la carga del logo
      console.warn('No se pudo cargar logo para la factura:', e.message);
    }

    // Header
    doc.setFillColor(250, 250, 250);
    doc.rect(0, 0, pageWidth, 120, 'F');

    // Logo y header (ajustable)
    const logoWidth = 80; // ajustar ancho del logo aquí
    const logoHeight = 72; // ajustar alto del logo aquí
    const logoX = margin;
    const logoY = 18;

    if (logoDataUrl) {
      try {
        // addImage no soporta borderRadius en esta versión; usamos tamaño y posición
        doc.addImage(logoDataUrl, 'PNG', logoX, logoY, logoWidth, logoHeight);
      } catch (e) {
        console.warn('addImage falló:', e.message);
      }
    }

    // Posiciones dependientes del logo
    const headerTitleX = margin + logoWidth + 16;
    const headerY = 36;
    const headerRightX = pageWidth - margin - 180;

    doc.setFontSize(20);
    doc.setTextColor(30, 30, 30);
    doc.text('MOTOREPUESTOS LA 33', headerTitleX, headerY);
    doc.setFontSize(10);
    doc.setTextColor(90, 90, 90);
    doc.text('RIF-J-123456789-0', headerTitleX, headerY + 18);
    doc.text('Dirección: avenida 5ta, San Cristobal, Edo Táchira', headerTitleX, headerY + 31);
    doc.text(`Factura: ${invoiceNumber}`, headerTitleX, headerY + 45);
    doc.text(`Fecha: ${date}`, headerTitleX, headerY + 54);

    // Billing box
    const boxY = 140;
    doc.setDrawColor(200, 200, 200);
    // Usar rect simple (roundRect no disponible en esta versión de jsPDF)
    doc.setDrawColor(200, 200, 200);
    doc.rect(margin, boxY, pageWidth - margin * 2, 60);
    doc.setFontSize(11);
    doc.setTextColor(50, 50, 50);
    doc.text('Facturar a:', margin + 10, boxY + 20);
    doc.setFontSize(12);
    doc.text(customerName, margin + 70, boxY + 20);
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(customerEmail, margin + 10, boxY + 35);

    // Table headers
    const tableTop = boxY + 90;
    const colWidths = [60, pageWidth - margin * 2 - 60 - 120, 60, 120];
    let x = margin;
    let y = tableTop;

    // Draw header row background
    doc.setFillColor(245, 245, 245);
    doc.rect(x, y, colWidths[0], 24, 'F');
    doc.rect(x + colWidths[0], y, colWidths[1], 24, 'F');
    doc.rect(x + colWidths[0] + colWidths[1], y, colWidths[2], 24, 'F');
    doc.rect(x + colWidths[0] + colWidths[1] + colWidths[2], y, colWidths[3], 24, 'F');

    doc.setDrawColor(220, 220, 220);
    doc.rect(x, y, colWidths.reduce((a, b) => a + b, 0), 24);

    doc.setFontSize(8);
    doc.setTextColor(80, 80, 80);
    doc.text('Cant', x + 8, y + 16);
    doc.text('Descripción', x + colWidths[0] + 8, y + 16);
    doc.text('V. Unit', x + colWidths[0] + colWidths[1] + 8, y + 16);
    doc.text('Subtotal', x + colWidths[0] + colWidths[1] + colWidths[2] + 8, y + 16);

    y += 28;

    // Items
    doc.setFontSize(8);
    for (let i = 0; i < order.items.length; i++) {
      const item = order.items[i];
      const rowHeight = 20;

      // Alternate row fill
      if (i % 2 === 0) {
        doc.setFillColor(255, 255, 255);
      } else {
        doc.setFillColor(250, 250, 250);
      }
      doc.rect(x, y - 4, colWidths.reduce((a, b) => a + b, 0), rowHeight, 'F');

      doc.setTextColor(40, 40, 40);
      doc.text(String(item.quantity), x + 8, y + 12);
      // Truncate description if too long
      const desc = item.product_name.length > 60 ? item.product_name.slice(0, 57) + '...' : item.product_name;
      doc.text(desc, x + colWidths[0] + 8, y + 12);
      doc.text(formatCOP(item.unit_price), x + colWidths[0] + colWidths[1] + 8, y + 12);
      doc.text(formatCOP(item.unit_price * item.quantity), x + colWidths[0] + colWidths[1] + colWidths[2] + 8, y + 12);

      y += rowHeight + 4;
      if (y > doc.internal.pageSize.getHeight() - 120) {
        doc.addPage();
        y = margin;
      }
    }

    // Totals box
    const totalsX = pageWidth - margin - 220;
    const totalsY = y + 10;
    doc.setDrawColor(220, 220, 220);
    // Reemplazo de rounded rect por rect normal
    doc.rect(totalsX, totalsY, 220, 72);

    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text('Subtotal', totalsX + 12, totalsY + 22);
    doc.text(formatCOP(order.subtotal), totalsX + 140, totalsY + 22);
    doc.text('IVA 16%', totalsX + 12, totalsY + 40);
    doc.text(formatCOP(order.tax_amount), totalsX + 140, totalsY + 40);
    doc.setFontSize(12);
    doc.setTextColor(30, 30, 30);
    doc.text('TOTAL', totalsX + 12, totalsY + 60);
    doc.text(formatCOP(order.total_amount), totalsX + 140, totalsY + 60);

    // Footer
    doc.setFontSize(9);
    doc.setTextColor(120, 120, 120);
    doc.text('Gracias por su compra en MOTOREPUESTOS LA 33', margin, doc.internal.pageSize.getHeight() - 40);

    doc.save(`factura-${invoiceNumber}.pdf`);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed':
        return <CBadge color="success" className="badge-badge px-3 py-2">APROBADO</CBadge>;
      case 'rejected':
        return <CBadge color="danger" className="badge-badge px-3 py-2">RECHAZADO</CBadge>;
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
      <h2 className="fw-bold mb-4" style={{ color: 'var(--text-primary)' }}>Mis Compras</h2>

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
                  <span className="fw-bold price" style={{ color: 'var(--text-primary)' }}>ORD-{order.id}</span>
                </div>
                <div>
                  <span className="text-muted small d-block">Fecha de Transacción:</span>
                  <span className="fw-bold price-sm" style={{ color: 'var(--text-primary)' }}>{formatDate(order.created_at)}</span>
                </div>
                <div>
                  <span className="text-muted small d-block">Estado de Pago:</span>
                  {getStatusBadge(order.status)}
                </div>
                <div className="text-end">
                  <span className="text-muted small d-block">Total Cobrado:</span>
                  <span className="price text-white fw-bold">{formatCOP(order.total_amount)}</span>
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
                        <span className="fw-semibold text-secondary d-block ">{item.product_name}</span>
                        <span className="text-secondary">Cantidad: {item.quantity} u.</span>
                      </div>
                    </div>
                    <div className="text-end">
                      <span className="text-secondary d-block">{formatCOP(item.unit_price * item.quantity)}</span>
                      <span className="text-secondary small">{formatCOP(item.unit_price)} c/u</span>
                    </div>
                  </div>
                ))}
                
                <CRow className="mt-3 align-items-center">
                  <CCol xs={12} md={6}>
                    <div className="text-secondary small">Subtotal: {formatCOP(order.subtotal)}</div>
                    <div className="text-secondary small">IVA 16%: {formatCOP(order.tax_amount)}</div>
                    <div className="text-secondary fw-bold">Total: {formatCOP(order.total_amount)}</div>
                  </CCol>
                  <CCol xs={12} md={6} className="text-md-end mt-3 mt-md-0">
                    {order.status === 'completed' && (
                      <CButton color="success" className="me-2 mb-2" onClick={() => generateInvoicePdf(order)}>
                        Descargar Factura PDF
                      </CButton>
                    )}
                    {order.payment_intent_id && (
                      <div className="text-muted small">ID Stripe: <span className="font-monospace text-secondary">{order.payment_intent_id}</span></div>
                    )}
                  </CCol>
                </CRow>
              </CCardBody>
            </CCard>
          ))}
        </div>
      )}
    </CContainer>
  );
};

export default OrdersHistory;
