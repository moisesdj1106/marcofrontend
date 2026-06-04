import React from 'react';
import { CContainer, CRow, CCol } from '@coreui/react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="modern-footer">
      <CContainer>
        <CRow className="g-4">
          <CCol lg={4} md={6}>
            <div className="footer-brand mb-4">
              <div className="logo-footer mb-3">
                <img 
                  src="src/public/Gemini_Generated_Image_7oobzk7oobzk7oob.png" 
                  alt="Antigravity Repuestos"
                  className="footer-logo-img"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.parentNode.innerHTML = '<div class="footer-logo-placeholder">AR</div>';
                  }}
                />
              </div>
              <h3 className="fw-bold mb-2">
                <span className="gradient-text">MOTOREPUESTOS</span> LA TREINTA Y 3
              </h3>
              <p className="text-secondary mb-0">
                Tu tienda de confianza para repuestos originales de motocicletas para toda cilindrada.
              </p>
            </div>
          </CCol>

          <CCol lg={2} md={6}>
            <h5 className="fw-bold mb-3 text-dark">Enlaces Rápidos</h5>
            <ul className="footer-links list-unstyled">
              <li className="mb-2">
                <Link to="/" className="footer-link">Inicio</Link>
              </li>
              <li className="mb-2">
                <Link to="/" className="footer-link">Catálogo</Link>
              </li>
              <li className="mb-2">
                <Link to="/nosotros" className="footer-link">Nosotros</Link>
              </li>
              <li className="mb-2">
                <Link to="/carrito" className="footer-link">Carrito</Link>
              </li>
            </ul>
          </CCol>

          <CCol lg={3} md={6}>
            <h5 className="fw-bold mb-3 text-dark">Contacto</h5>
            <ul className="footer-contact list-unstyled">
              <li className="mb-2 d-flex align-items-start">
                <span className="contact-icon me-2">📍</span>
                <span className="text-secondary">Av. 5ta, San Cristóbal, Edo Táchira, Venezuela</span>
              </li>
              <li className="mb-2 d-flex align-items-start">
                <span className="contact-icon me-2">📞</span>
                <span className="text-secondary">+58 04147146601</span>
              </li>
              <li className="mb-2 d-flex align-items-start">
                <span className="contact-icon me-2">✉️</span>
                <span className="text-secondary">repuestosla33@gmail.com</span>
              </li>
              <li className="mb-2 d-flex align-items-start">
                <span className="contact-icon me-2">🕒</span>
                <span className="text-secondary">Lun - Vie: 8:00 AM - 5:00 PM</span>
              </li>
            </ul>
          </CCol>

          <CCol lg={3} md={6}>
            <h5 className="fw-bold mb-3 text-dark">Newsletter</h5>
            <p className="text-secondary mb-3">
              Suscríbete para recibir ofertas exclusivas y novedades.
            </p>
            <div className="newsletter-form">
              <div className="input-group mb-3">
                <input 
                  type="email" 
                  className="form-control" 
                  placeholder="Tu correo electrónico"
                  aria-label="Email"
                />
                <button className="btn btn-warning" type="button">
                  Suscribir
                </button>
              </div>
            </div>
            <div className="social-links mt-4">
              <a href="#" className="social-link me-3">📘</a>
              <a href="#" className="social-link me-3">📸</a>
              <a href="#" className="social-link me-3">📺</a>
              <a href="#" className="social-link">💼</a>
            </div>
          </CCol>
        </CRow>

        <div className="footer-bottom mt-5 pt-4 border-top border-secondary">
          <CRow className="align-items-center">
            <CCol md={6} className="mb-3 mb-md-0">
              <p className="mb-0 text-secondary small">
                &copy; {new Date().getFullYear()}  MotoRepuestosLa33. Todos los derechos reservados.
              </p>
            </CCol>
            <CCol md={6} className="text-md-end">
              <div className="d-flex flex-wrap justify-content-md-end gap-3">
                <a href="#" className="footer-bottom-link small">Términos y Condiciones</a>
                <a href="#" className="footer-bottom-link small">Política de Privacidad</a>
                <a href="#" className="footer-bottom-link small">Aviso Legal</a>
              </div>
            </CCol>
          </CRow>
        </div>
      </CContainer>
    </footer>
  );
};

export default Footer;