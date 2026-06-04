import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  CContainer, 
  CRow, 
  CCol, 
  CCard, 
  CCardBody, 
  CCardTitle, 
  CSpinner,
  CFormSelect,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell
} from '@coreui/react';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [periodFilter, setPeriodFilter] = useState('month'); // 'day', 'week', 'month', 'year'
  const { getAuthHeaders } = useAuth();

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:4000/api/reports/dashboard-stats', {
        headers: getAuthHeaders()
      });
      const data = await response.json();
      if (response.ok) {
        setStats(data);
      }
    } catch (error) {
      console.error('Error al recuperar reportes:', error);
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

  if (loading || !stats) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '70vh' }}>
        <CSpinner color="danger" variant="grow" />
      </div>
    );
  }

  // Determinar los datos del gráfico según el período seleccionado
  let activePeriodData = [];
  if (periodFilter === 'day') activePeriodData = stats.salesByDay;
  if (periodFilter === 'week') activePeriodData = stats.salesByWeek;
  if (periodFilter === 'month') activePeriodData = stats.salesByMonth;
  if (periodFilter === 'year') activePeriodData = stats.salesByYear;

  // Encontrar el valor máximo para calcular los porcentajes del gráfico de barras CSS
  const maxSalesValue = activePeriodData.length > 0 
    ? Math.max(...activePeriodData.map(item => item.total_sales), 1) 
    : 1;

  return (
    <CContainer className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="text fw-bold m-0">Panel de Control y Reportes</h2>
        <button onClick={fetchDashboardStats} className="btn-red py-2 px-3">Actualizar Datos 🔄</button>
      </div>

      {/* Tarjetas de Resumen Rápido (KPIs) */}
      <CRow className="g-3 mb-5">
        <CCol sm={6} lg={3}>
          <CCard className="glass-panel border-0 text-white h-100">
            <CCardBody className="d-flex flex-column justify-content-between p-4">
              <span className="text-secondary small text-uppercase tracking-wider">Ganancias Totales</span>
              <div className="my-2">
                <span className="h2 fw-extrabold text-white">{formatCOP(stats.summary.total_revenue)}</span>
              </div>
              <span className="text-success small">Ventas Confirmadas Stripe</span>
            </CCardBody>
          </CCard>
        </CCol>
        <CCol sm={6} lg={3}>
          <CCard className="glass-panel border-0 text-white h-100">
            <CCardBody className="d-flex flex-column justify-content-between p-4">
              <span className="text-secondary small text-uppercase tracking-wider">Órdenes Exitosas</span>
              <div className="my-2">
                <span className="h2 fw-extrabold text-white">{stats.summary.completed_orders}</span>
              </div>
              <span className="text-secondary small">Transacciones Aprobadas</span>
            </CCardBody>
          </CCard>
        </CCol>
        <CCol sm={6} lg={3}>
          <CCard className="glass-panel border-0 text-white h-100">
            <CCardBody className="d-flex flex-column justify-content-between p-4">
              <span className="text-secondary small text-uppercase tracking-wider">Órdenes Rechazadas</span>
              <div className="my-2">
                <span className="h2 fw-extrabold text-danger">{stats.summary.rejected_orders}</span>
              </div>
              <span className="text-danger small">Fondos Insuficientes / Fallas</span>
            </CCardBody>
          </CCard>
        </CCol>
        <CCol sm={6} lg={3}>
          <CCard className="glass-panel border-0 text-white h-100">
            <CCardBody className="d-flex flex-column justify-content-between p-4">
              <span className="text-secondary small text-uppercase tracking-wider">Repuestos Vendidos</span>
              <div className="my-2">
                <span className="h2 fw-extrabold text-warning">{stats.summary.total_products_sold} u.</span>
              </div>
              <span className="text-secondary small">Clientes Registrados: {stats.summary.total_clients}</span>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>

      <CRow className="g-4">
        {/* Gráfico Analítico de Ventas */}
        <CCol lg={8}>
          <div className="glass-panel p-4 h-100">
            <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
              <div>
                <h4 className="text-white fw-bold m-0 text-uppercase tracking-wide">Desempeño de Ventas</h4>
                <p className="text-muted small mb-0">Evolución de los ingresos de la tienda</p>
              </div>
              <div style={{ width: '180px' }}>
                <CFormSelect 
                  value={periodFilter} 
                  onChange={(e) => setPeriodFilter(e.target.value)}
                  className="py-1 px-2 border-secondary small"
                >
                  <option value="day">Últimos 30 días</option>
                  <option value="week">Últimas 12 semanas</option>
                  <option value="month">Últimos 12 meses</option>
                  <option value="year">Histórico por Año</option>
                </CFormSelect>
              </div>
            </div>

            {activePeriodData.length === 0 ? (
              <div className="text-center py-5">
                <p className="text-muted">No hay ventas registradas en este período para graficar.</p>
              </div>
            ) : (
              <div>
                {/* Contenedor del gráfico de barras CSS interactivo y premium */}
                <div className="d-flex align-items-end justify-content-between gap-2 pt-4 px-2 mb-4" style={{ height: '240px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                  {activePeriodData.map((item, idx) => {
                    const heightPercent = (item.total_sales / maxSalesValue) * 100;
                    return (
                      <div 
                        key={idx} 
                        className="d-flex flex-column align-items-center position-relative group" 
                        style={{ flex: 1, minWidth: '20px' }}
                      >
                        {/* Tooltip con valor exacto al hover */}
                        <div className="bg-black text-white text-xs px-2 py-1 rounded position-absolute opacity-0 group-hover:opacity-100 transition-opacity" style={{ bottom: `${heightPercent + 10}%`, zIndex: 10, whiteSpace: 'nowrap', fontSize: '0.75rem', border: '1px solid rgba(255,255,255,0.2)' }}>
                          {formatCOP(item.total_sales)} ({item.total_orders} ped.)
                        </div>
                        {/* Barra */}
                        <div 
                          className="w-100 rounded-top" 
                          style={{ 
                            height: `${Math.max(heightPercent, 3)}%`, 
                            background: 'linear-gradient(to top, #ff3b30, #ff9500)',
                            opacity: 0.85,
                            boxShadow: '0 0 10px rgba(255,59,48,0.25)',
                            transition: 'height 0.5s ease-out'
                          }}
                        ></div>
                      </div>
                    );
                  })}
                </div>
                {/* Etiquetas de períodos */}
                <div className="d-flex justify-content-between text-muted" style={{ fontSize: '0.75rem' }}>
                  <span>{activePeriodData[0]?.period}</span>
                  <span>{activePeriodData[Math.floor(activePeriodData.length / 2)]?.period}</span>
                  <span>{activePeriodData[activePeriodData.length - 1]?.period}</span>
                </div>
              </div>
            )}

            {/* Tabla Detallada del Período */}
            <div className="mt-4 overflow-auto">
              <CTable align="middle" borderless hover responsive size="sm" className="small">
                <CTableHead>
                  <CTableRow className="border-bottom border-secondary">
                    <CTableHeaderCell>Período</CTableHeaderCell>
                    <CTableHeaderCell className="text-center">Órdenes</CTableHeaderCell>
                    <CTableHeaderCell className="text-end">Ingresos</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {[...activePeriodData].reverse().slice(0, 5).map((item, idx) => (
                    <CTableRow key={idx} className="border-bottom border-secondary">
                      <CTableDataCell className="text-white fw-semibold">{item.period}</CTableDataCell>
                      <CTableDataCell className="text-center">{item.total_orders} exitosas</CTableDataCell>
                      <CTableDataCell className="text-end text-white">{formatCOP(item.total_sales)}</CTableDataCell>
                    </CTableRow>
                  ))}
                </CTableBody>
              </CTable>
              {activePeriodData.length > 5 && (
                <span className="text-muted small italic d-block text-center mt-2">Mostrando los 5 registros más recientes</span>
              )}
            </div>
          </div>
        </CCol>

        {/* Productos Más Vendidos */}
        <CCol lg={4}>
          <div className="glass-panel p-4 h-100 d-flex flex-column justify-content-between">
            <div>
              <h4 className="text-white fw-bold mb-1 text-uppercase tracking-wide">Más Vendidos</h4>
              <p className="text-muted small mb-4">Repuestos con mayor volumen de salida</p>

              {stats.topProducts.length === 0 ? (
                <div className="text-center py-5">
                  <p className="text-muted">Aún no hay registros de repuestos vendidos.</p>
                </div>
              ) : (
                <div className="d-flex flex-column gap-3">
                  {stats.topProducts.map((prod, idx) => (
                    <div key={prod.id} className="d-flex align-items-center justify-content-between p-2 rounded bg-dark border border-secondary" style={{ backgroundColor: 'rgba(255,255,255,0.01)' }}>
                      <div className="d-flex align-items-center gap-2">
                        <span className="fw-extrabold text-secondary me-1" style={{ fontSize: '1.25rem' }}>#{idx + 1}</span>
                        <div>
                          <span className="text-white fw-semibold d-block text-truncate" style={{ maxWidth: '160px' }} title={prod.name}>
                            {prod.name}
                          </span>
                          <span className="text-muted small">{prod.qty_sold} unidades vendidas</span>
                        </div>
                      </div>
                      <div className="text-end">
                        <span className="text-success small fw-bold d-block">{formatCOP(prod.revenue)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="mt-4 p-3 rounded text-center small text-muted" style={{ border: '1px dashed rgba(255,255,255,0.1)', backgroundColor: 'rgba(255,255,255,0.005)' }}>
              El volumen de salida afecta directamente el stock en inventario en cascada. Controla el abastecimiento en la pestaña de gestión.
            </div>
          </div>
        </CCol>
      </CRow>
    </CContainer>
  );
};

export default Dashboard;
