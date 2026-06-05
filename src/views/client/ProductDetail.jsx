import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { API_URL } from '../../utils/api';
import { getProductImage } from '../../utils/imageHelper';
import { 
  CContainer, 
  CRow, 
  CCol, 
  CButton, 
  CBadge, 
  CCard, 
  CCardImage, 
  CCardBody, 
  CCardTitle, 
  CSpinner 
} from '@coreui/react';
import { CIcon } from '@coreui/icons-react';
import { cilArrowLeft, cilCart } from '@coreui/icons';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  useEffect(() => {
    fetchProductDetails();
  }, [id]);

  const [error, setError] = useState(null);

  const fetchProductDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const prodRes = await fetch(`${API_URL}/api/products/${id}`);
      if (!prodRes.ok) {
        if (prodRes.status === 404) {
          throw new Error('Producto no encontrado');
        }
        throw new Error(`HTTP error! status: ${prodRes.status}`);
      }
      const prodData = await prodRes.json();
      setProduct(prodData);
      setQuantity(1);

      const recRes = await fetch(`${API_URL}/api/products/${id}/recommendations`);
      if (recRes.ok) {
        const recData = await recRes.json();
        setRecommendations(recData);
      }
    } catch (fetchError) {
      console.error('Error al cargar detalle del producto:', fetchError);
      setError(fetchError.message || 'Error al cargar el producto');
      if (fetchError.message === 'Producto no encontrado') {
        navigate('/');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleIncrement = () => {
    if (quantity < product.stock) {
      setQuantity(quantity + 1);
    }
  };

  const handleDecrement = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
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

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '70vh' }}>
        <CSpinner color="danger" variant="grow" />
      </div>
    );
  }

  if (error) {
    return (
      <CContainer className="py-5 text-center">
        <h2 className="text-white mb-4">No se pudo cargar el producto</h2>
        <p className="text-secondary mb-4">{error}</p>
        <CButton color="secondary" onClick={() => navigate('/')}>Volver al inicio</CButton>
      </CContainer>
    );
  }

  if (!product) return null;

  return (
    <CContainer className="py-4">
      {/* Botón de volver */}
      <CButton 
        onClick={() => navigate(-1)} 
        color="secondary" 
        className="btn-outline-red text-white mb-4 d-inline-flex align-items-center gap-2 py-2"
        style={{ border: '1px solid rgba(255,255,255,0.1)' }}
      >
        <CIcon icon={cilArrowLeft} /> Volver al Catálogo
      </CButton>

      {/* Tarjeta de Detalle Principal */}
      <div className="glass-panel p-4 p-md-5 mb-5">
        <CRow className="g-4 lg:g-5 align-items-center">
          <CCol md={6}>
            <div className="rounded-4 overflow-hidden border border-secondary" style={{ maxHeight: '420px', boxShadow: '0 8px 24px rgba(0,0,0,0.6)' }}>
              <img 
                src={getProductImage(product.image_url)} 
                alt={product.name} 
                className="img-fluid w-100 h-100"
                style={{ objectFit: 'cover', width: '100%', height: '100%', minHeight: '300px' }}
              />
            </div>
          </CCol>
          <CCol md={6} className="d-flex flex-column gap-3">
            <div>
              <CBadge color="danger" className="badge-badge px-3 py-2 mb-2">
                {product.category_name}
              </CBadge>
              <h2 className="text-black display-6 fw-bold">{product.name}</h2>
            </div>
            
            <p className="text-secondary fs-5" style={{ lineHeight: '1.6' }}>
              {product.description}
            </p>

            <div className="my-2">
              <span className="text-muted d-block small mb-1">Precio Unitario:</span>
              <span className="h1 text-black fw-extrabold">{formatCOP(product.price)}</span>
            </div>

            <div className="d-flex align-items-center gap-3">
              <span className="text-secondary font-medium">Disponibilidad:</span>
              {product.stock > 0 ? (
                <CBadge color="success" shape="rounded-pill" className="px-3 py-2">
                  En Stock: {product.stock} unidades
                </CBadge>
              ) : (
                <CBadge color="danger" shape="rounded-pill" className="px-3 py-2">
                  Agotado temporalmente
                </CBadge>
              )}
            </div>

            {product.stock > 0 && (
              <div className="d-flex align-items-center gap-3 mt-3">
                <span className="text-secondary font-medium">Cantidad:</span>
                <div className="d-flex align-items-center border border-secondary rounded bg-dark">
                  <CButton color="dark" onClick={handleDecrement} className="px-3 text-white border-0">-</CButton>
                  <span className="px-3 text-white fw-bold" style={{ minWidth: '40px', textAlign: 'center' }}>{quantity}</span>
                  <CButton color="dark" onClick={handleIncrement} className="px-3 text-white border-0">+</CButton>
                </div>
              </div>
            )}

            <div className="mt-4">
              <CButton 
                disabled={product.stock <= 0}
                onClick={() => addToCart(product, quantity)} 
                className="btn-red w-100 py-3 d-flex align-items-center justify-content-center gap-2 fs-5"
              >
                <CIcon icon={cilCart} /> Añadir al Carrito
              </CButton>
            </div>
          </CCol>
        </CRow>
      </div>

      {/* Venta Cruzada / Recomendaciones */}
      {recommendations.length > 0 && (
        <div className="mt-5">
          <div className="border-bottom border-secondary pb-2 mb-4">
            <h3 className="text-black fw-bold tracking-tight">
              ¿Por qué no llevas también? <span style={{ color: '#ff9500' }}></span>
            </h3>
            <p className="text-muted mb-0">Otros usuarios de MOTOREPUESTOS LA 33 agregaron estos complementos:</p>
          </div>
          
          <CRow xs={{ cols: 1 }} sm={{ cols: 2 }} md={{ cols: 4 }} className="g-4">
            {recommendations.map((item) => (
              <CCol key={item.id}>
                <CCard className="h-100 product-card d-flex flex-column">
                  <div style={{ height: '140px', overflow: 'hidden' }}>
                    <CCardImage
                      orientation="top"
                      src={getProductImage(item.image_url)}
                      alt={item.name}
                      style={{ objectFit: 'cover', height: '100%', width: '100%' }}
                    />
                  </div>
                  <CCardBody className="d-flex flex-column justify-content-between p-3" style={{ flex: '1 0 auto' }}>
                    <div>
                      <CCardTitle className="h6 text-white text-truncate mb-1" title={item.name}>
                        {item.name}
                      </CCardTitle>
                      <span className="text-secondary fw-semibold small mb-2 d-block">
                        {formatCOP(item.price)}
                      </span>
                    </div>
                    <div className="d-grid gap-1">
                      <CButton 
                        as={Link} 
                        to={`/producto/${item.id}`} 
                        color="secondary" 
                        className="btn-outline-red text-white py-1 px-2 small"
                        style={{ fontSize: '0.85rem' }}
                      >
                        Ver Ficha
                      </CButton>
                      <CButton 
                        onClick={() => addToCart(item, 1)} 
                        className="btn-red py-1 px-2 small"
                        style={{ fontSize: '0.85rem' }}
                      >
                        Agregar
                      </CButton>
                    </div>
                  </CCardBody>
                </CCard>
              </CCol>
            ))}
          </CRow>
        </div>
      )}
    </CContainer>
  );
};

export default ProductDetail;
