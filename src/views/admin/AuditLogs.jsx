import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getApiUrl } from '../../utils/api';
import { 
  CContainer, 
  CTable, 
  CTableHead, 
  CTableRow, 
  CTableHeaderCell, 
  CTableBody, 
  CTableDataCell, 
  CBadge, 
  CSpinner,
  CButton,
  CCollapse,
  CCard,
  CCardBody
} from '@coreui/react';

const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedLogId, setExpandedLogId] = useState(null);
  const { getAuthHeaders } = useAuth();

  useEffect(() => {
    fetchAuditLogs();
  }, []);

  const fetchAuditLogs = async () => {
    setLoading(true);
    try {
      const response = await fetch(getApiUrl('/api/audit'), {
        headers: getAuthHeaders()
      });
      const data = await response.json();
      if (response.ok) {
        setLogs(data);
      }
    } catch (err) {
      console.error('Error al recuperar logs de auditoría:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const options = { 
      year: 'numeric', 
      month: '2-digit', 
      day: '2-digit', 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit' 
    };
    return new Date(dateString).toLocaleDateString('es-CO', options);
  };

  const getActionBadge = (action) => {
    switch (action) {
      case 'COMPLETED_PURCHASE':
        return <CBadge color="success" className="badge-badge px-2 py-1">PAGO EXITOSO (STRIPE)</CBadge>;
      case 'REJECTED_PURCHASE':
        return <CBadge color="danger" className="badge-badge px-2 py-1">TRANSACCIÓN DECLINADA</CBadge>;
      case 'LOGIN':
        return <CBadge color="primary" className="badge-badge px-2 py-1">INICIO SESIÓN</CBadge>;
      case 'LOGIN_FAILED':
        return <CBadge color="danger" className="badge-badge px-2 py-1">INICIO FALLIDO</CBadge>;
      case 'REGISTER':
        return <CBadge color="info" className="badge-badge px-2 py-1">REGISTRO</CBadge>;
      case 'CREATE_PRODUCT':
      case 'CREATE_CATEGORY':
        return <CBadge color="warning" className="badge-badge px-2 py-1 text-dark">CREACIÓN</CBadge>;
      case 'UPDATE_PRODUCT':
        return <CBadge color="warning" className="badge-badge px-2 py-1 text-dark">EDICIÓN</CBadge>;
      case 'DELETE_PRODUCT':
      case 'DELETE_CATEGORY':
        return <CBadge color="danger" className="badge-badge px-2 py-1">ELIMINACIÓN</CBadge>;
      default:
        return <CBadge color="secondary" className="badge-badge px-2 py-1">{action}</CBadge>;
    }
  };

  const toggleExpand = (id) => {
    if (expandedLogId === id) {
      setExpandedLogId(null);
    } else {
      setExpandedLogId(id);
    }
  };

  return (
    <CContainer className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold m-0" style={{ color: 'var(--text-primary)' }}>Auditoría del Sistema</h2>
          <p className="text-muted mb-0">Listado de seguridad: quién, cuándo y qué acción realizó en la tienda</p>
        </div>
        <button onClick={fetchAuditLogs} className="btn-red py-2 px-3">Refrescar Logs 🔄</button>
      </div>

      {loading ? (
        <div className="d-flex justify-content-center py-5">
          <CSpinner color="danger" variant="grow" />
        </div>
      ) : logs.length === 0 ? (
        <div className="text-center py-5 glass-panel">
          <h3 className="text-secondary">No se han registrado logs de auditoría</h3>
          <p className="text-muted">Las acciones realizadas por usuarios y administradores aparecerán aquí.</p>
        </div>
      ) : (
        <div className="glass-panel p-3 overflow-auto">
          <CTable align="middle" responsive borderless hover>
            <CTableHead>
              <CTableRow className="border-bottom border-secondary">
                <CTableHeaderCell>Fecha / Hora</CTableHeaderCell>
                <CTableHeaderCell>Usuario responsable</CTableHeaderCell>
                <CTableHeaderCell>Acción ejecutada</CTableHeaderCell>
                <CTableHeaderCell>Módulo</CTableHeaderCell>
                <CTableHeaderCell className="text-center">Detalles</CTableHeaderCell>
              </CTableRow>
            </CTableHead>
            <CTableBody>
              {logs.map((log) => (
                <React.Fragment key={log.id}>
                  <CTableRow className="border-bottom border-secondary">
                    <CTableDataCell className="text-secondary small">
                      {formatDate(log.created_at)}
                    </CTableDataCell>
                    <CTableDataCell>
                      <div className="d-flex flex-column">
                        <span className="text- fw-bold">{log.username}</span>
                        <span className="text-muted small" style={{ fontSize: '0.75rem' }}>
                          ID: #{log.user_id || 'N/A'} {log.user_fullname ? `(${log.user_role})` : ''}
                        </span>
                      </div>
                    </CTableDataCell>
                    <CTableDataCell>
                      {getActionBadge(log.action)}
                    </CTableDataCell>
                    <CTableDataCell>
                      <CBadge color="dark" style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
                        {log.entity}
                      </CBadge>
                    </CTableDataCell>
                    <CTableDataCell className="text-center">
                      <CButton 
                        size="sm" 
                        color="dark" 
                        onClick={() => toggleExpand(log.id)}
                        style={{ border: '1px solid rgba(255,255,255,0.1)' }}
                      >
                        {expandedLogId === log.id ? 'Ocultar' : 'Ver JSON'}
                      </CButton>
                    </CTableDataCell>
                  </CTableRow>
                  
                  {/* Fila colapsable de detalles de auditoría */}
                  <CTableRow>
                    <CTableDataCell colSpan={5} className="p-0">
                      <CCollapse visible={expandedLogId === log.id}>
                        <div className="p-3 bg-dark border-bottom border-secondary">
                          <CCard style={{ backgroundColor: '#0f1015', border: '1px solid rgba(255,255,255,0.05)' }}>
                            <CCardBody className="p-3">
                              <span className="text-secondary small d-block mb-2 font-bold uppercase">Metadatos de la Operación (Payload):</span>
                              {log.details ? (
                                <pre className="text-warning m-0 small" style={{ overflowX: 'auto', fontFamily: 'monospace' }}>
                                  {JSON.stringify(log.details, null, 2)}
                                </pre>
                              ) : (
                                <span className="text-muted italic small">No se registraron parámetros adicionales para esta acción.</span>
                              )}
                            </CCardBody>
                          </CCard>
                        </div>
                      </CCollapse>
                    </CTableDataCell>
                  </CTableRow>
                </React.Fragment>
              ))}
            </CTableBody>
          </CTable>
        </div>
      )}
    </CContainer>
  );
};

export default AuditLogs;
