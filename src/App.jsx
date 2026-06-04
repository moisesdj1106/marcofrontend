import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Contextos
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';

// Componentes
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

// Vistas del Cliente
import Home from './views/client/Home';
import ProductDetail from './views/client/ProductDetail';
import Cart from './views/client/Cart';
import Checkout from './views/client/Checkout';
import OrdersHistory from './views/client/OrdersHistory';
import AboutUs from './views/client/AboutUs';

// Vistas de Autenticación
import Login from './views/Login';
import Register from './views/Register';

// Vistas del Administrador
import Dashboard from './views/admin/Dashboard';
import Inventory from './views/admin/Inventory';
import AuditLogs from './views/admin/AuditLogs';
import Invoices from './views/admin/Invoices';

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <div className="d-flex flex-column min-vh-100">
            <Navbar />
            
            <main className="flex-grow-1 animate-fade-in">
              <Routes>
                {/* Rutas Públicas */}
                <Route path="/" element={<Home />} />
                <Route path="/producto/:id" element={<ProductDetail />} />
                <Route path="/carrito" element={<Cart />} />
                <Route path="/nosotros" element={<AboutUs />} />
                <Route path="/login" element={<Login />} />
                <Route path="/registro" element={<Register />} />

                {/* Rutas Protegidas del Cliente */}
                <Route 
                  path="/checkout" 
                  element={
                    <ProtectedRoute>
                      <Checkout />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/mis-compras" 
                  element={
                    <ProtectedRoute>
                      <OrdersHistory />
                    </ProtectedRoute>
                  } 
                />

                {/* Rutas de Administración (Protegidas y de acceso exclusivo Admin) */}
                <Route 
                  path="/admin/dashboard" 
                  element={
                    <ProtectedRoute adminOnly>
                      <Dashboard />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/admin/inventario" 
                  element={
                    <ProtectedRoute adminOnly>
                      <Inventory />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/admin/auditoria" 
                  element={
                    <ProtectedRoute adminOnly>
                      <AuditLogs />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/admin/facturas" 
                  element={
                    <ProtectedRoute adminOnly>
                      <Invoices />
                    </ProtectedRoute>
                  } 
                />

                {/* Ruta de redirección fallback */}
                <Route path="*" element={<Home />} />
              </Routes>
            </main>

            <Footer />
          </div>
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
