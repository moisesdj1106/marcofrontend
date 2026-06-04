import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { API_URL } from '../../utils/api';
import { getProductImage } from '../../utils/imageHelper';
import { 
  CContainer, 
  CRow, 
  CCol, 
  CCard, 
  CCardImage, 
  CCardBody, 
  CCardTitle, 
  CCardText, 
  CFormInput, 
  CFormSelect, 
  CButton, 
  CBadge,
  CSpinner
} from '@coreui/react';
import '@coreui/coreui/dist/css/coreui.min.css';
import { cilArrowRight, cilStar, cilCheckCircle, cilShieldAlt, cilTruck } from '@coreui/icons';
import CIcon from '@coreui/icons-react';

const Home = () => {
  const [products, setProducts] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [loading, setLoading] = useState(false);
  const [showAllProducts, setShowAllProducts] = useState(false);
  const [currentBanner, setCurrentBanner] = useState(0);
  const { addToCart } = useCart();
  const productsSectionRef = useRef(null);

  // Banners mejorados con imágenes ocupando todo el contenedor
  const banners = [
    {
      id: 1,
      title: "Potencia Deportiva",
      subtitle: "Repuestos de alto rendimiento para motos deportivas",
      image: "/otro.png",
      buttonText: "Ver Repuestos",
      link: "#productos",
      textColor: "text-white"
      
    },
    {
      id: 2,
      title: "Garantía Original 100%",
      subtitle: "Todos nuestros repuestos cuentan con garantía del fabricante",
      image: "/baner1.png",
      buttonText: "Conocer Más",
      link: "/nosotros",
      textColor: "white"
    },
    {
      id: 3,
      title: "Envío Express 24h",
      subtitle: "Entrega en 24 horas para todo Medellín y área metropolitana",
      image: "/baner2.png",
      buttonText: "Comprar Ahora",
      link: "#productos",
      textColor: "white"
    }
  ];

  useEffect(() => {
    fetchCategories();
    fetchFeaturedProducts();
    
    // Auto-rotación de banners
    const bannerInterval = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % banners.length);
    }, 5000);
    
    return () => clearInterval(bannerInterval);
  }, []);

  useEffect(() => {
    if (search || categoryId) {
      fetchProducts();
    }
  }, [search, categoryId]);

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${API_URL}/api/products/categories`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error('Error al obtener categorías:', error);
      // Datos de ejemplo para desarrollo
      setCategories([
        { id: 1, name: 'Frenos' },
        { id: 2, name: 'Motor' },
        { id: 3, name: 'Suspensión' },
        { id: 4, name: 'Eléctrico' },
        { id: 5, name: 'Accesorios' }
      ]);
    }
  };

  const fetchFeaturedProducts = async () => {
    try {
      const response = await fetch(`${API_URL}/api/products/featured`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      setFeaturedProducts(data.slice(0, 4));
    } catch (error) {
      console.error('Error al obtener productos destacados:', error);
      // Datos de ejemplo para desarrollo
      setFeaturedProducts([
        {
          id: 1,
          name: 'Kit de Freno Delantero',
          description: 'Kit completo de frenos delanteros para motos deportivas',
          price: 85000,
          stock: 15,
          image_url: '/moto.jpg',
          category_name: 'Frenos'
        },
        {
          id: 2,
          name: 'Bujía NGK Iridium',
          description: 'Bujía de alto rendimiento para mejor combustión',
          price: 35000,
          stock: 8,
          image_url: '/moto.jpg',
          category_name: 'Motor'
        },
        {
          id: 3,
          name: 'Amortiguador Trasero',
          description: 'Amortiguador ajustable para mejor suspensión',
          price: 120000,
          stock: 5,
          image_url: '/moto.jpg',
          category_name: 'Suspensión'
        },
        {
          id: 4,
          name: 'Batería Yuasa',
          description: 'Batería de gel mantenimiento libre',
          price: 95000,
          stock: 12,
          image_url: '/moto.jpg',
          category_name: 'Eléctrico'
        }
      ]);
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (search) queryParams.append('search', search);
      if (categoryId) queryParams.append('categoryId', categoryId);

      const response = await fetch(`${API_URL}/api/products?${queryParams.toString()}`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      setProducts(data);
      if (!search && !categoryId) {
        setFeaturedProducts(data.slice(0, 4));
      }
    } catch (error) {
      console.error('Error al obtener productos:', error);
      // Datos de ejemplo para desarrollo
      const exampleProducts = [
        {
          id: 1,
          name: 'Kit de Freno Delantero',
          description: 'Kit completo de frenos delanteros para motos deportivas',
          price: 85000,
          stock: 15,
          image_url: '/moto.jpg',
          category_name: 'Frenos'
        },
        {
          id: 2,
          name: 'Bujía NGK Iridium',
          description: 'Bujía de alto rendimiento para mejor combustión',
          price: 35000,
          stock: 8,
          image_url: '/moto.jpg',
          category_name: 'Motor'
        },
        {
          id: 3,
          name: 'Amortiguador Trasero',
          description: 'Amortiguador ajustable para mejor suspensión',
          price: 120000,
          stock: 5,
          image_url: '/moto.jpg',
          category_name: 'Suspensión'
        },
        {
          id: 4,
          name: 'Batería Yuasa',
          description: 'Batería de gel mantenimiento libre',
          price: 95000,
          stock: 12,
          image_url: '/moto.jpg',
          category_name: 'Eléctrico'
        },
        {
          id: 5,
          name: 'Cadena de Transmisión',
          description: 'Cadena O-ring para mayor durabilidad',
          price: 65000,
          stock: 20,
          image_url: '/moto.jpg',
          category_name: 'Transmisión'
        },
        {
          id: 6,
          name: 'Filtro de Aire K&N',
          description: 'Filtro de alto flujo lavable',
          price: 75000,
          stock: 10,
          image_url: '/moto.jpg',
          category_name: 'Motor'
        },
        {
          id: 7,
          name: 'Pastillas de Freno',
          description: 'Pastillas orgánicas para frenado suave',
          price: 45000,
          stock: 25,
          image_url: '/moto.jpg',
          category_name: 'Frenos'
        },
        {
          id: 8,
          name: 'Aceite Motul 7100',
          description: 'Aceite sintético 10W40 para alto rendimiento',
          price: 55000,
          stock: 30,
          image_url: '/moto.jpg',
          category_name: 'Lubricantes'
        }
      ];
      let filteredProducts = exampleProducts;
      if (search) {
        const searchLower = search.toLowerCase();
        filteredProducts = exampleProducts.filter(p => 
          p.name.toLowerCase().includes(searchLower) || 
          p.description.toLowerCase().includes(searchLower)
        );
      }
      if (categoryId) {
        filteredProducts = filteredProducts.filter(p => 
          p.category_name.toLowerCase().includes(categories.find(c => c.id == categoryId)?.name?.toLowerCase() || '')
        );
      }
      setProducts(filteredProducts);
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

  const scrollToProducts = () => {
    if (productsSectionRef.current) {
      productsSectionRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const nextBanner = () => {
    setCurrentBanner((prev) => (prev + 1) % banners.length);
  };

  const prevBanner = () => {
    setCurrentBanner((prev) => (prev - 1 + banners.length) % banners.length);
  };

  const features = [
    {
      icon: cilShieldAlt,
      title: "Garantía Original",
      description: "Todos nuestros repuestos cuentan con garantía del fabricante",
      color: "var(--accent-blue)"
    },
    {
      icon: cilCheckCircle,
      title: "Calidad Premium",
      description: "Marcas reconocidas y homologadas internacionalmente",
      color: "var(--accent-orange)"
    },
    {
      icon: cilTruck,
      title: "Entrega Rápida",
      description: "Despacho en 24h dentro de Medellín y área metropolitana",
      color: "#059669"
    },
    {
      icon: cilStar,
      title: "Asesoría Especializada",
      description: "Equipo técnico para resolver tus dudas de instalación",
      color: "#7c3aed"
    }
  ];

  return (
    <div className="home-page">
      {/* ==========================================
         SECCIÓN HERO CON BANNERS MEJORADOS
         ========================================== */}
      <section className="hero-section">
        <div className="banner-container position-relative overflow-hidden rounded-bottom-4">
          {/* Banner actual */}
          <div 
            className="banner-slide position-relative"
            style={{
              height: '500px',
              backgroundImage: `url('${banners[currentBanner].image}')`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              transition: 'opacity 0.5s ease'
            }}
          >
            {/* Overlay oscuro para mejor contraste */}
            <div className="banner-overlay position-absolute top-0 start-0 w-100 h-100"
              style={{
                background: 'linear-gradient(135deg, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.4) 100%)'
              }}
            />
            
            <CContainer className="position-relative z-2 h-100 d-flex align-items-center">
              <CRow className="align-items-center">
                <CCol lg={8} className="text-white">
                  <h1 className="display-3 fw-bold mb-3 banner-title">
                    {banners[currentBanner].title}
                  </h1>
                  <p className="lead mb-4 banner-subtitle" style={{ fontSize: '1.25rem', opacity: 0.9 }}>
                    {banners[currentBanner].subtitle}
                  </p>
                  <div className="d-flex flex-wrap gap-3">
                    <CButton 
                      color="warning" 
                      size="lg"
                      as={banners[currentBanner].link.startsWith('#') ? undefined : Link}
                      to={banners[currentBanner].link.startsWith('#') ? undefined : banners[currentBanner].link}
                      onClick={banners[currentBanner].link === "#productos" ? scrollToProducts : undefined}
                      className="px-4 py-3 fw-bold"
                    >
                      {banners[currentBanner].buttonText}
                      <CIcon icon={cilArrowRight} className="ms-2" />
                    </CButton>
                    <CButton 
                      color="outline-light" 
                      variant="outline"
                      size="lg"
                      as={Link}
                      to="/nosotros"
                      className="px-4 py-3"
                    >
                      Conoce Más
                    </CButton>
                  </div>
                </CCol>
              </CRow>
            </CContainer>
          </div>

          {/* Controles del banner */}
          <button 
            className="banner-control banner-control-prev position-absolute top-50 start-0 translate-middle-y"
            onClick={prevBanner}
            style={{
              left: '20px',
              background: 'rgba(255, 255, 255, 0.2)',
              border: 'none',
              width: '50px',
              height: '50px',
              borderRadius: '50%',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}
          >
            <span style={{ fontSize: '1.5rem' }}>‹</span>
          </button>
          
          <button 
            className="banner-control banner-control-next position-absolute top-50 end-0 translate-middle-y"
            onClick={nextBanner}
            style={{
              right: '20px',
              background: 'rgba(255, 255, 255, 0.2)',
              border: 'none',
              width: '50px',
              height: '50px',
              borderRadius: '50%',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}
          >
            <span style={{ fontSize: '1.5rem' }}>›</span>
          </button>

          {/* Indicadores del banner */}
          <div className="banner-indicators position-absolute bottom-0 start-50 translate-middle-x mb-4 d-flex gap-2">
            {banners.map((_, index) => (
              <button
                key={index}
                className={`banner-indicator ${index === currentBanner ? 'active' : ''}`}
                onClick={() => setCurrentBanner(index)}
                style={{
                  width: '12px',
                  height: '12px',
                  borderRadius: '50%',
                  border: 'none',
                  background: index === currentBanner ? 'var(--accent-orange)' : 'rgba(255, 255, 255, 0.5)',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer'
                }}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ==========================================
         SECCIÓN DE CARACTERÍSTICAS
         ========================================== */}
      <section className="features-section py-5">
        <CContainer>
          <div className="text-center mb-5">
            <h2 className="display-5 fw-bold mb-3">
              Por qué elegir <span className="gradient-text">MOTOREPUESTOS LA 33</span>
            </h2>
            <p className="text-secondary fs-5" style={{ maxWidth: '700px', margin: '0 auto' }}>
              Brindamos calidad, confianza y rendimiento a todos los moteros de la ciudad no importa la cilindrada
            </p>
          </div>
          
          <CRow className="g-4">
            {features.map((feature, index) => (
              <CCol lg={3} md={6} key={index} className="feature-card-col">
                <div className="feature-card glass-panel p-4 h-100 text-center">
                  <div className="feature-icon mb-3" style={{
                    width: '70px',
                    height: '70px',
                    margin: '0 auto',
                    background: `${feature.color}15`,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: `2px solid ${feature.color}30`
                  }}>
                    <CIcon 
                      icon={feature.icon} 
                      size="xxl" 
                      style={{ color: feature.color }}
                    />
                  </div>
                  <h4 className="h5 fw-bold mb-2 text-dark">{feature.title}</h4>
                  <p className="text-secondary mb-0">{feature.description}</p>
                </div>
              </CCol>
            ))}
          </CRow>
        </CContainer>
      </section>

      {/* ==========================================
         SECCIÓN DE PRODUCTOS DESTACADOS
         ========================================== */}
      <section className="featured-products py-5" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
        <CContainer>
          <div className="text-center mb-5">
            <h2 className="display-5 fw-bold mb-3 text-dark">
              Productos <span className="gradient-text">Destacados</span>
            </h2>
            <p className="text-secondary fs-5">
              Los repuestos más buscados por nuestros clientes
            </p>
          </div>

          {featuredProducts.length > 0 ? (
            <CRow xs={{ cols: 1 }} sm={{ cols: 2 }} md={{ cols: 3 }} lg={{ cols: 4 }} className="g-4">
              {featuredProducts.map((product, index) => (
                <CCol key={product.id} className={`product-grid-item stagger-${(index % 4) + 1}`}>
                  <CCard className="h-100 product-card d-flex flex-column">
                    <div className="position-relative" style={{ height: '200px', overflow: 'hidden' }}>
                      <CCardImage
                        orientation="top"
                          src={getProductImage(product.image_url)}
                        alt={product.name}
                        style={{ objectFit: 'cover', height: '100%', width: '100%' }}
                      />
                      <CBadge 
                        color="secondary" 
                        className="position-absolute top-2 start-2 badge-badge py-2 px-3"
                        style={{ backgroundColor: 'rgba(0,0,0,0.65)', border: '1px solid rgba(255,255,255,0.1)' }}
                      >
                        {product.category_name || 'Repuesto'}
                      </CBadge>
                    </div>
                    <CCardBody className="d-flex flex-column justify-content-between p-3">
                      <div>
                        <CCardTitle className="h5 text-dark text-truncate mb-1" title={product.name}>
                          {product.name}
                        </CCardTitle>
                        <CCardText className="text-secondary small text-truncate-2-lines mb-3" style={{ height: '40px' }}>
                          {product.description || 'Repuesto de alta calidad para motocicletas'}
                        </CCardText>
                      </div>
                      
                      <div>
                        <div className="d-flex justify-content-between align-items-center mb-3">
                          <span className="h4 text-dark fw-bold mb-0">
                            {formatCOP(product.price)}
                          </span>
                          {product.stock > 0 ? (
                            <CBadge color="success" shape="rounded-pill" className="py-2 px-2 small">
                              Stock: {product.stock} u.
                            </CBadge>
                          ) : (
                            <CBadge color="danger" shape="rounded-pill" className="py-2 px-2 small">
                              Agotado
                            </CBadge>
                          )}
                        </div>
                        <div className="d-grid gap-2">
                          <CButton 
                            as={Link} 
                            to={`/producto/${product.id}`} 
                            color="secondary" 
                            className="btn-outline-red text-dark py-2"
                            style={{ border: '1px solid var(--accent-orange)' }}
                          >
                            Ver Ficha
                          </CButton>
                          <CButton 
                            disabled={!product.stock || product.stock <= 0}
                            onClick={() => addToCart(product, 1)} 
                            className="btn-red py-2"
                          >
                            Añadir al Carrito
                          </CButton>
                        </div>
                      </div>
                    </CCardBody>
                  </CCard>
                </CCol>
              ))}
            </CRow>
          ) : (
            <div className="text-center py-5">
              <CSpinner color="danger" variant="grow" />
            </div>
          )}

          <div className="text-center mt-5">
            <CButton 
              color="primary" 
              size="lg"
              onClick={() => setShowAllProducts(true)}
              as={Link}
              to="#productos"
              className="px-5 py-3"
              style={{ 
                background: 'linear-gradient(135deg, var(--accent-blue) 0%, var(--accent-orange) 100%)',
                border: 'none'
              }}
            >
              Ver Todos los Productos
              <CIcon icon={cilArrowRight} className="ms-2" />
            </CButton>
          </div>
        </CContainer>
      </section>

      {/* ==========================================
         SECCIÓN DE BÚSQUEDA Y CATÁLOGO COMPLETO
         ========================================== */}
      <section className="products-section py-5" id="productos" ref={productsSectionRef}>
        <CContainer>
          <div className="text-center mb-5">
            <h2 className="display-5 fw-bold mb-3 text-dark">
              Catálogo <span className="gradient-text">Completo</span>
            </h2>
            <p className="text-secondary fs-5 mb-4">
              Encuentra el repuesto perfecto para tu motocicleta
            </p>
            
            {/* Buscador y Filtros Mejorados */}
            <div className="search-container glass-panel p-4 mb-5" style={{ maxWidth: '800px', margin: '0 auto' }}>
              <CRow className="g-3 align-items-center">
                <CCol md={6}>
                  <div className="position-relative">
                    <CFormInput
                      type="text"
                      placeholder="🔍 Buscar repuesto por nombre, descripción o modelo..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="py-3 ps-4"
                      style={{ borderRadius: '12px' }}
                    />
                  </div>
                </CCol>
                <CCol md={4}>
                  <CFormSelect
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="py-3"
                    style={{ borderRadius: '12px' }}
                  >
                    <option value="">🏷️ Todas las Categorías</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </CFormSelect>
                </CCol>
                <CCol md={2} className="d-grid">
                  <CButton 
                    onClick={() => { setSearch(''); setCategoryId(''); }} 
                    color="secondary" 
                    className="py-3"
                    style={{ borderRadius: '12px' }}
                  >
                    Limpiar
                  </CButton>
                </CCol>
              </CRow>
            </div>
          </div>

          {/* Listado de Productos */}
          {loading ? (
            <div className="d-flex justify-content-center my-5 py-5">
              <CSpinner color="danger" variant="grow" />
              <span className="ms-3 text-dark">Buscando repuestos...</span>
            </div>
          ) : products.length === 0 && (search || categoryId) ? (
            <div className="text-center py-5 glass-panel">
              <h3 className="text-dark mb-3">No encontramos repuestos coincidentes</h3>
              <p className="text-muted">Prueba con otras palabras clave o selecciona otra categoría.</p>
              <CButton 
                onClick={() => { setSearch(''); setCategoryId(''); }}
                color="primary"
                className="mt-3"
              >
                Ver Todos los Productos
              </CButton>
            </div>
          ) : (products.length > 0 || showAllProducts) ? (
            <>
              <CRow xs={{ cols: 1 }} sm={{ cols: 2 }} md={{ cols: 3 }} lg={{ cols: 4 }} className="g-4">
                {(products.length > 0 ? products : featuredProducts).map((product, index) => (
                  <CCol key={product.id} className={`product-grid-item stagger-${(index % 8) + 1}`}>
                    <CCard className="h-100 product-card d-flex flex-column">
                      <div className="position-relative" style={{ height: '200px', overflow: 'hidden' }}>
                        <CCardImage
                          orientation="top"
                            src={getProductImage(product.image_url)}
                          alt={product.name}
                          style={{ objectFit: 'cover', height: '100%', width: '100%' }}
                        />
                        <CBadge 
                          color="secondary" 
                          className="position-absolute top-2 start-2 badge-badge py-2 px-3"
                          style={{ backgroundColor: 'rgba(0,0,0,0.65)', border: '1px solid rgba(255,255,255,0.1)' }}
                        >
                          {product.category_name || 'Repuesto'}
                        </CBadge>
                      </div>
                      <CCardBody className="d-flex flex-column justify-content-between p-3">
                        <div>
                          <CCardTitle className="h5 text-dark text-truncate mb-1" title={product.name}>
                            {product.name}
                          </CCardTitle>
                          <CCardText className="text-secondary small text-truncate-2-lines mb-3" style={{ height: '40px' }}>
                            {product.description || 'Repuesto de alta calidad para motocicletas'}
                          </CCardText>
                        </div>
                        
                        <div>
                          <div className="d-flex justify-content-between align-items-center mb-3">
                            <span className="h4 text-dark fw-bold mb-0">
                              {formatCOP(product.price)}
                            </span>
                            {product.stock > 0 ? (
                              <CBadge color="success" shape="rounded-pill" className="py-2 px-2 small">
                                Stock: {product.stock} u.
                              </CBadge>
                            ) : (
                              <CBadge color="danger" shape="rounded-pill" className="py-2 px-2 small">
                                Agotado
                              </CBadge>
                            )}
                          </div>
                          <div className="d-grid gap-2">
                            <CButton 
                              as={Link} 
                              to={`/producto/${product.id}`} 
                              color="secondary" 
                              className="btn-outline-red text-dark py-2"
                              style={{ border: '1px solid var(--accent-orange)' }}
                            >
                              Ver Ficha
                            </CButton>
                            <CButton 
                              disabled={!product.stock || product.stock <= 0}
                              onClick={() => addToCart(product, 1)} 
                              className="btn-red py-2"
                            >
                              Añadir al Carrito
                            </CButton>
                          </div>
                        </div>
                      </CCardBody>
                    </CCard>
                  </CCol>
                ))}
              </CRow>
              
              {products.length === 0 && showAllProducts && (
                <div className="text-center mt-4">
                  <p className="text-secondary">Mostrando productos destacados. Usa el buscador para encontrar repuestos específicos.</p>
                </div>
              )}
            </>
          ) : null}
        </CContainer>
      </section>

      {/* ==========================================
         SECCIÓN DE CALL TO ACTION
         ========================================== */}
      <section className="cta-section py-5" style={{ 
        background: 'linear-gradient(135deg, var(--accent-blue) 0%, #003d82 100%)'
      }}>
        <CContainer>
          <CRow className="align-items-center">
            <CCol lg={8} className="text-white">
              <h2 className="display-4 fw-bold mb-3 text-white">
                ¿Necesitas ayuda para elegir el repuesto correcto?
              </h2>
              <p className="lead mb-4 opacity-90">
                Nuestros expertos te asesorarán gratuitamente para que encuentres la pieza perfecta para tu motocicleta.
              </p>
              <div className="d-flex flex-wrap gap-3">
                <CButton 
                  color="light" 
                  size="lg"
                  as={Link}
                  to="/nosotros"
                  className="px-4 py-3 fw-bold"
                >
                  Contactar Asesor
                  <CIcon icon={cilArrowRight} className="ms-2" />
                </CButton>
                <CButton 
                  color="outline-light" 
                  variant="outline"
                  size="lg"
                  className="px-4 py-3 text-white"
                  onClick={() => window.open('tel:+58 0414-758-9654')}
                >
                  📞 Llamar Ahora
                </CButton>
              </div>
            </CCol>
            <CCol lg={4} className="text-center">
              <div className="cta-image mt-4 mt-lg-0">
                <img 
                  src="/Gemini_Generated_Image_7oobzk7oobzk7oob.png" 
                  alt="Asesoría Técnica"
                  className="img-fluid"
                  style={{ 
                    maxHeight: '200px',
                    borderRadius: '15px',
                    boxShadow: '0 15px 30px rgba(0,0,0,0.2)'
                  }}
                />
              </div>
            </CCol>
          </CRow>
        </CContainer>
      </section>
    </div>
  );
};

export default Home;