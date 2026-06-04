import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getApiUrl } from '../utils/api';
import { 
  CContainer, 
  CRow, 
  CCol, 
  CCard, 
  CCardBody, 
  CForm, 
  CFormInput, 
  CButton, 
  CAlert,
  CSpinner
} from '@coreui/react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch(getApiUrl('/api/auth/login'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // Guardar sesión en Contexto
        login(data.user, data.token);
        
        // Redirigir según corresponda
        if (data.user.role === 'admin') {
          navigate('/admin/dashboard');
        } else {
          navigate(redirect);
        }
      } else {
        setError(data.error || 'Correo o contraseña incorrectos.');
      }
    } catch (err) {
      setError('Error en la comunicación con el servidor.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <CContainer className="py-5">
      <CRow className="justify-content-center">
        <CCol md={6} lg={5}>
          <CCard className="glass-panel border-0 text-white">
            <CCardBody className="p-4 p-md-5">
              <div className="text-center mb-4">
                <img 
                  src="https://img.icons8.com/color/48/motorcycle.png" 
                  alt="Logo" 
                  width="50" 
                  className="mb-2"
                />
                <h3 className="fw-extrabold text-uppercase text-white" style={{ fontFamily: 'Outfit, sans-serif' }}>
                  Ingresar a la Tienda
                </h3>
                <p className="text-secondary small">MOTOREPUESTOS LA 33</p>
              </div>

              {error && <CAlert color="danger">{error}</CAlert>}

              <CForm onSubmit={handleSubmit} className="d-flex flex-column gap-3">
                <div>
                  <label className="text-secondary small mb-1">Correo Electrónico</label>
                  <CFormInput
                    type="email"
                    required
                    placeholder="correo@ejemplo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="py-2"
                  />
                </div>

                <div>
                  <label className="text-secondary small mb-1">Contraseña</label>
                  <CFormInput
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="py-2"
                  />
                </div>

                <div className="d-grid mt-3">
                  <CButton type="submit" disabled={loading} className="btn-red py-2 fs-6">
                    {loading ? <CSpinner size="sm" /> : 'Iniciar Sesión'}
                  </CButton>
                </div>
              </CForm>

              <div className="text-center mt-4 text-secondary small">
                <span>¿No tienes cuenta? </span>
                <Link to="/registro" className="text-danger fw-bold text-decoration-none">
                  Regístrate aquí
                </Link>
              </div>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
    </CContainer>
  );
};

export default Login;
