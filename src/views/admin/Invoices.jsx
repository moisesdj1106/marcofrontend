import React, { useEffect, useState } from 'react';
import jsPDF from 'jspdf';
import { useAuth } from '../../context/AuthContext';
import { getApiUrl } from '../../utils/api';
import {
  CContainer,
  CCard,
  CCardHeader,
  CCardBody,
  CButton,
  CSpinner,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CBadge
} from '@coreui/react';

const Invoices = () => {
  const { getAuthHeaders } = useAuth();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      const response = await fetch(getApiUrl('/api/orders/all'), {
        headers: getAuthHeaders()
      });
      const data = await response.json();
      if (response.ok) {
        setInvoices(data);
      }
    } catch (error) {
      console.error('Error al cargar facturas:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCOP = (val) => {
    return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'Bs',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
    }).format(val);
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('es-CO', options);
  };

  const createInvoicePdf = async (order) => {
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
      console.warn('No se pudo cargar logo para la factura:', e.message);
    }

    // Header
    doc.setFillColor(250, 250, 250);
    doc.rect(0, 0, pageWidth, 120, 'F');

    // Logo y header (ajustable)
    const logoWidth = 80;
    const logoHeight = 72;
    const logoX = margin;
    const logoY = 18;

    if (logoDataUrl) {
      try {
        doc.addImage(logoDataUrl, 'PNG', logoX, logoY, logoWidth, logoHeight);
      } catch (e) {
        console.warn('addImage falló:', e.message);
      }
    }

    const headerTitleX = margin + logoWidth + 16;
    const headerY = 36;
    const headerRightX = pageWidth - margin - 180;

    doc.setFontSize(20);
    doc.setTextColor(30, 30, 30);
    doc.text('MOTOREPUESTOS LA 33', headerTitleX, headerY);
    doc.setFontSize(10);
    doc.setTextColor(90, 90, 90);
    doc.text('RIF: J-123456789-0', headerTitleX, headerY + 18);
    doc.text('Dirección: Calle Falsa 123, Bogotá', headerTitleX, headerY + 32);
    doc.text(`Factura: ${invoiceNumber}`,  headerTitleX, headerY + 43);
    doc.text(`Fecha: ${date}`,  headerTitleX, headerY + 55);

    // Billing box
    const boxY = 140;
    doc.setDrawColor(200, 200, 200);
    doc.rect(margin, boxY, pageWidth - margin * 2, 60);
    doc.setFontSize(11);
    doc.setTextColor(50, 50, 50);
    doc.text('Facturar a:', margin + 10, boxY + 20);
    doc.setFontSize(12);
    doc.text(customerName, margin + 10, boxY + 36);
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(customerEmail, margin + 10, boxY + 50);

    // Table headers
    const tableTop = boxY + 90;
    const colWidths = [60, pageWidth - margin * 2 - 60 - 120, 60, 120];
    let x = margin;
    let y = tableTop;

    doc.setFillColor(245, 245, 245);
    doc.rect(x, y, colWidths[0], 24, 'F');
    doc.rect(x + colWidths[0], y, colWidths[1], 24, 'F');
    doc.rect(x + colWidths[0] + colWidths[1], y, colWidths[2], 24, 'F');
    doc.rect(x + colWidths[0] + colWidths[1] + colWidths[2], y, colWidths[3], 24, 'F');

    doc.setDrawColor(220, 220, 220);
    doc.rect(x, y, colWidths.reduce((a, b) => a + b, 0), 24);

    doc.setFontSize(10);
    doc.setTextColor(80, 80, 80);
    doc.text('Cant', x + 8, y + 16);
    doc.text('Descripción', x + colWidths[0] + 8, y + 16);
    doc.text('V. Unit', x + colWidths[0] + colWidths[1] + 8, y + 16);
    doc.text('Subtotal', x + colWidths[0] + colWidths[1] + colWidths[2] + 8, y + 16);

    y += 28;

    // Items
    doc.setFontSize(10);
    const items = order.items || [];
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const rowHeight = 20;

      if (i % 2 === 0) {
        doc.setFillColor(255, 255, 255);
      } else {
        doc.setFillColor(250, 250, 250);
      }
      doc.rect(x, y - 4, colWidths.reduce((a, b) => a + b, 0), rowHeight, 'F');

      doc.setTextColor(40, 40, 40);
      doc.text(String(item.quantity), x + 8, y + 12);
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

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '70vh' }}>
        <CSpinner color="danger" variant="grow" />
      </div>
    );
  }

  return (
    <CContainer className="py-4">
      <h2 className="fw-bold mb-4" style={{ color: 'var(--text-primary)' }}>Facturas de Clientes</h2>
      <p className="text-secondary mb-4">Aquí puedes ver todas las órdenes con el desglose de IVA y descargar el PDF de cada factura.</p>

      <CCard className="glass-panel border-0 p-3">
        <CCardBody>
          <CTable responsive>
            <CTableHead>
              <CTableRow>
                <CTableHeaderCell>Factura</CTableHeaderCell>
                <CTableHeaderCell>Cliente</CTableHeaderCell>
                <CTableHeaderCell>Fecha</CTableHeaderCell>
                <CTableHeaderCell>Estado</CTableHeaderCell>
                <CTableHeaderCell className="text-end">Total</CTableHeaderCell>
                <CTableHeaderCell className="text-end">Acciones</CTableHeaderCell>
              </CTableRow>
            </CTableHead>
            <CTableBody>
              {invoices.map((order) => (
                <CTableRow key={order.id}>
                  <CTableDataCell>ORD-{order.id}</CTableDataCell>
                  <CTableDataCell>
                    <div className="fw-semibold">{order.billing_name || order.user_name}</div>
                    <div className="small text-secondary">{order.billing_email || order.user_email}</div>
                  </CTableDataCell>
                  <CTableDataCell>{formatDate(order.created_at)}</CTableDataCell>
                  <CTableDataCell>
                    <CBadge color={order.status === 'completed' ? 'success' : order.status === 'pending' ? 'warning' : 'danger'}>
                      {order.status.toUpperCase()}
                    </CBadge>
                  </CTableDataCell>
                  <CTableDataCell className="text-end">{formatCOP(order.total_amount)}</CTableDataCell>
                  <CTableDataCell className="text-end">
                    <CButton size="sm" color="primary" onClick={() => createInvoicePdf(order)}>
                      Descargar PDF
                    </CButton>
                  </CTableDataCell>
                </CTableRow>
              ))}
            </CTableBody>
          </CTable>
        </CCardBody>
      </CCard>
    </CContainer>
  );
};

export default Invoices;
