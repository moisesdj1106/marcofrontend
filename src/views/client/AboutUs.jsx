import React from 'react';
import { CContainer, CRow, CCol, CCard, CCardBody, CButton } from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { cilCheckCircle, cilBullhorn, cilMap, cilPeople, cilShieldAlt, cilGraph } from '@coreui/icons';
import { Link } from 'react-router-dom';

const AboutUs = () => {
  const values = [
    {
      icon: cilShieldAlt,
      title: "Seguridad Garantizada",
      description: "Todos nuestros repuestos cumplen con los más altos estándares de seguridad y calidad",
      color: "var(--accent-blue)"
    },
    {
      icon: cilPeople,
      title: "Atención Personalizada",
      description: "Asesoría técnica especializada para cada cliente y tipo de motocicleta",
      color: "var(--accent-orange)"
    },
    {
      icon: cilCheckCircle,
      title: "Calidad Certificada",
      description: "Marcas homologadas y respaldadas por certificaciones internacionales",
      color: "#059669"
    },
    {
      icon: cilGraph,
      title: "Innovación Constante",
      description: "Siempre a la vanguardia con las últimas tecnologías y soluciones",
      color: "#7c3aed"
    }
  ];

  const teamMembers = [
    {
      name: "Carlos Mendoza",
      role: "Fundador & CEO",
      expertise: "Más de 20 años en el sector de repuestos",
      image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200&h=200&fit=crop"
    },
    {
      name: "Ana Rodríguez",
      role: "Directora Técnica",
      expertise: "Ingeniería Mecánica especializada en motocicletas",
      image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w-200&h=200&fit=crop"
    },
    {
      name: "Miguel Torres",
      role: "Gerente Comercial",
      expertise: "Relaciones con fabricantes y distribución",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop"
    }
  ];

  return (
    <div className="about-page">
      {/* HERO SECTION */}
      <section className="hero-section py-5" style={{ 
        background: 'linear-gradient(135deg, var(--accent-blue) 0%, #003d82 100%)',
        color: 'white'
      }}>
        <CContainer>
          <div className="text-center py-5 ">
            <h1 className="text-white display-3 fw-bold mb-4 animate-fade-in ">
              Más que una tienda,<br />somos tu <span className="titulo">aliado en el camino</span>
            </h1>
            <p className="lead mb-5 opacity-90" style={{ maxWidth: '800px', margin: '0 auto', fontSize: '1.25rem' }}>
               entregando confianza, seguridad y rendimiento a motociclistas en toda Venezuela
            </p>

          </div>
        </CContainer>
      </section>

      {/* STORY SECTION */}
      <section className="story-section py-5">
        <CContainer>
          <CRow className="align-items-center g-5">
            <CCol lg={6} className="animate-slide-in-left">
              <div className="position-relative">
                <img 
                  src="/moto.jpg" 
                  alt="Nuestra Historia" 
                  className="img-fluid rounded-4 shadow-lg"
                  style={{ 
                    transform: 'perspective(1000px) rotateY(-5deg)',
                    transition: 'transform 0.5s ease'
                  }}
                  onMouseEnter={(e) => e.target.style.transform = 'perspective(1000px) rotateY(0deg)'}
                  onMouseLeave={(e) => e.target.style.transform = 'perspective(1000px) rotateY(-5deg)'}
                />
                <div className="position-absolute top-0 start-0 w-100 h-100 bg-gradient" style={{
                  background: 'linear-gradient(45deg, rgba(0,86,179,0.1) 0%, rgba(255,107,0,0.1) 100%)',
                  borderRadius: '1rem',
                  zIndex: 1
                }} />
              </div>
            </CCol>
            <CCol lg={6} className="animate-slide-in-right">
              <h2 className="display-5 fw-bold mb-4">
                Nuestra <span className="gradient-text">Historia</span>
              </h2>
              <p className="text-secondary fs-5 mb-4" style={{ lineHeight: '1.8' }}>
                <strong className="text-dark">MOTOREPUESTOS LA 33</strong> nació en el corazón de San Cristóbal, en la emblemática Avenida 5ta, como respuesta a una necesidad clara: los motociclistas merecían acceso a repuestos de calidad, asesoría técnica confiable y un servicio transparente.
              </p>
              <p className="text-secondary fs-5 mb-4" style={{ lineHeight: '1.8' }}>
                Lo que comenzó como un pequeño local familiar, hoy es una empresa líder en el sector, con presencia digital y física, ofreciendo más de 2,000 referencias de repuestos originales y homologados para todo tipo de motocicletas.
              </p>
              <div className="stats-container d-flex flex-wrap gap-4 mt-5">
                <div className="text-center">
                  <h3 className="display-4 fw-bold gradient-text mb-0">15+</h3>
                  <p className="text-secondary mb-0">Años de Experiencia</p>
                </div>
                <div className="text-center">
                  <h3 className="display-4 fw-bold gradient-text mb-0">2,000+</h3>
                  <p className="text-secondary mb-0">Referencias</p>
                </div>
                <div className="text-center">
                  <h3 className="display-4 fw-bold gradient-text mb-0">10,000+</h3>
                  <p className="text-secondary mb-0">Clientes Satisfechos</p>
                </div>
              </div>
            </CCol>
          </CRow>
        </CContainer>
      </section>

      {/* VALUES SECTION */}
      <section className="values-section py-5" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
        <CContainer>
          <div className="text-center mb-5">
            <h2 className="display-5 fw-bold mb-3">
              Nuestros <span className="gradient-text">Valores</span>
            </h2>
            <p className="text-secondary fs-5" style={{ maxWidth: '700px', margin: '0 auto' }}>
              Los principios que guían cada decisión que tomamos
            </p>
          </div>
          
          <CRow className="g-4">
            {values.map((value, index) => (
              <CCol lg={3} md={6} key={index} className="feature-card-col">
                <div className="value-card glass-panel p-4 h-100 text-center">
                  <div className="value-icon mb-3" style={{
                    width: '80px',
                    height: '80px',
                    margin: '0 auto',
                    background: `${value.color}15`,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: `3px solid ${value.color}30`
                  }}>
                    <CIcon 
                      icon={value.icon} 
                      size="xxl" 
                      style={{ color: value.color }}
                    />
                  </div>
                  <h4 className="h5 fw-bold mb-2">{value.title}</h4>
                  <p className="text-secondary mb-0">{value.description}</p>
                </div>
              </CCol>
            ))}
          </CRow>
        </CContainer>
      </section>

      {/* MISSION & VISION */}
      <section className="mission-section py-5">
        <CContainer>
          <CRow className="g-5">
            <CCol lg={6} className="mission-card animate-slide-in-left">
              <div className="glass-panel p-5 h-100" style={{ 
                background: 'linear-gradient(135deg, var(--accent-blue-light) 0%, white 100%)',
                borderLeft: '6px solid var(--accent-blue)'
              }}>
                <div className="d-flex align-items-center gap-3 mb-4">
                  <div className="p-3 rounded" style={{ 
                    background: 'var(--accent-blue-light)',
                    border: '2px solid var(--accent-blue)'
                  }}>
                    <CIcon icon={cilBullhorn} size="xl" style={{ color: 'var(--accent-blue)' }} />
                  </div>
                  <h3 className="fw-bold m-0" style={{ color: 'var(--accent-blue)' }}>
                    Nuestra Misión
                  </h3>
                </div>
                <p className="text-secondary fs-5" style={{ lineHeight: '1.8' }}>
                  Proveer soluciones integrales en repuestos y accesorios para motocicletas, garantizando la máxima seguridad, durabilidad y rendimiento en el camino. Nos comprometemos a brindar una asesoría transparente, respaldada por tecnologías digitales que simplifiquen las compras de nuestros clientes de forma ágil y 100% segura.
                </p>
              </div>
            </CCol>
            
            <CCol lg={6} className="vision-card animate-slide-in-right">
              <div className="glass-panel p-5 h-100" style={{ 
                background: 'linear-gradient(135deg, var(--accent-orange-light) 0%, white 100%)',
                borderLeft: '6px solid var(--accent-orange)'
              }}>
                <div className="d-flex align-items-center gap-3 mb-4">
                  <div className="p-3 rounded" style={{ 
                    background: 'var(--accent-orange-light)',
                    border: '2px solid var(--accent-orange)'
                  }}>
                    <CIcon icon={cilMap} size="xl" style={{ color: 'var(--accent-orange)' }} />
                  </div>
                  <h3 className="fw-bold m-0" style={{ color: 'var(--accent-orange)' }}>
                    Nuestra Visión
                  </h3>
                </div>
                <p className="text-secondary fs-5" style={{ lineHeight: '1.8' }}>
                  Consolidarnos para el año 2030 como la plataforma e-commerce de repuestos de motos líder a nivel nacional. Buscamos expandir nuestro catálogo con alianzas directas con fabricantes internacionales, optimizando continuamente nuestros procesos de distribución e inventarios en cascada para servir a cada rincón del país.
                </p>
              </div>
            </CCol>
          </CRow>
        </CContainer>
      </section>

      {/* SECCIÓN DE DOCUMENTOS PDF */}
      <section className="pdf-section py-5" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
        <CContainer>
          <div className="text-center mb-5">
            <h2 className="display-5 fw-bold mb-3">
              Documentación <span className="gradient-text">Oficial</span>
            </h2>
            <p className="text-secondary fs-5" style={{ maxWidth: '700px', margin: '0 auto' }}>
              Descarga nuestra documentación oficial para más información sobre garantías y políticas
            </p>
          </div>
          
          <CRow className="justify-content-center">
            <CCol lg={6} md={8}>
              <div className="pdf-card glass-panel p-5 text-center">
                <div className="pdf-icon mb-4" style={{
                  width: '80px',
                  height: '80px',
                  margin: '0 auto',
                  background: 'linear-gradient(135deg, var(--accent-blue) 0%, var(--accent-orange) 100%)',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <span style={{ fontSize: '2.5rem', color: 'white' }}>📄</span>
                </div>
                <h3 className="fw-bold mb-3">Documentación Legal De La Tienda</h3>
                <p className="text-secondary mb-4">
                  Consulta nuestro documento oficial donde nos constituimos legalmente frente al estado.
                </p>
                <CButton 
                  color="primary" 
                  size="lg"
                  className="px-5 py-3 fw-bold"
                  style={{ 
                    background: 'linear-gradient(135deg, var(--accent-blue) 0%, var(--accent-orange) 100%)',
                    border: 'none'
                  }}
                  onClick={() => window.open('/acta.pdf', '_blank')}
                >
                  📥 Abrir Documento PDF
                </CButton>
                <p className="text-muted small mt-3 mb-0">
                  El documento se abrirá en una nueva pestaña. Requiere Adobe Reader o visor de PDF.
                </p>
              </div>
            </CCol>
          </CRow>
        </CContainer>
      </section>

      {/* CTA SECTION */}
      <section className="cta-section py-5" style={{ 
        background: 'linear-gradient(135deg, #111827 0%, #374151 100%)',
        color: 'white'
      }}>
        <CContainer>
          <div className="text-center py-5">
            <h2 className="display-4 fw-bold mb-4 text-white">
              ¿Listo para experimentar la diferencia?
            </h2>
            <p className="lead mb-5 opacity-90" style={{ maxWidth: '600px', margin: '0 auto' }}>
              Descubre por qué miles de motociclistas confían en nosotros para sus repuestos
            </p>
            
            
              
            
          </div>
        </CContainer>
      </section>
    </div>
  );
};

export default AboutUs;