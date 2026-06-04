import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getApiUrl } from '../../utils/api';
import { 
  CContainer, 
  CRow, 
  CCol, 
  CTable, 
  CTableHead, 
  CTableRow, 
  CTableHeaderCell, 
  CTableBody, 
  CTableDataCell, 
  CButton, 
  CBadge, 
  CSpinner,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CForm,
  CFormInput,
  CFormTextarea,
  CFormSelect,
  CNav,
  CNavItem,
  CNavLink,
  CAlert
} from '@coreui/react';
import { CIcon } from '@coreui/icons-react';
import { cilPlus, cilPencil, cilTrash, cilWarning } from '@coreui/icons';

const Inventory = () => {
  const [activeTab, setActiveTab] = useState('products'); // 'products', 'categories'
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const { getAuthHeaders } = useAuth();

  // Modales
  const [productModal, setProductModal] = useState(false);
  const [categoryModal, setCategoryModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  // Estados de Formulario de Producto
  const [prodName, setProdName] = useState('');
  const [prodDesc, setProdDesc] = useState('');
  const [prodPrice, setProdPrice] = useState('');
  const [prodStock, setProdStock] = useState('');
  const [prodImg, setProdImg] = useState('');
  const [prodCatId, setProdCatId] = useState('');

  // Estados de Formulario de Categoría
  const [catName, setCatName] = useState('');
  const [catDesc, setCatDesc] = useState('');

  useEffect(() => {
    fetchInventoryData();
  }, []);

  const fetchInventoryData = async () => {
    setLoading(true);
    try {
      // Cargar productos
      const prodRes = await fetch(getApiUrl('/api/products'));
      const prodData = await prodRes.json();
      if (prodRes.ok) setProducts(prodData);

      // Cargar categorías
      const catRes = await fetch(getApiUrl('/api/products/categories'));
      const catData = await catRes.json();
      if (catRes.ok) setCategories(catData);
    } catch (err) {
      console.error('Error cargando inventario:', err);
    } finally {
      setLoading(false);
    }
  };

  // Abrir modal para crear producto
  const openCreateProduct = () => {
    setEditingProduct(null);
    setProdName('');
    setProdDesc('');
    setProdPrice('');
    setProdStock('');
    setProdImg('');
    setProdCatId(categories[0]?.id || '');
    setProductModal(true);
  };

  // Abrir modal para editar producto
  const openEditProduct = (product) => {
    setEditingProduct(product);
    setProdName(product.name);
    setProdDesc(product.description || '');
    setProdPrice(product.price);
    setProdStock(product.stock);
    setProdImg(product.image_url || '');
    setProdCatId(product.category_id || '');
    setProductModal(true);
  };

  // Guardar Producto (Crear o Editar)
  const handleSaveProduct = async (e) => {
    e.preventDefault();
    const payload = {
      name: prodName,
      description: prodDesc,
      price: parseFloat(prodPrice),
      stock: parseInt(prodStock),
      image_url: prodImg,
      category_id: parseInt(prodCatId)
    };

    const url = editingProduct 
      ? getApiUrl(`/api/products/${editingProduct.id}`) 
      : getApiUrl('/api/products');
    const method = editingProduct ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: getAuthHeaders(),
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (res.ok) {
        alert(data.message);
        setProductModal(false);
        fetchInventoryData();
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (err) {
      alert('Error en la conexión con el servidor.');
    }
  };

  // Eliminar Producto
  const handleDeleteProduct = async (id) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar este repuesto?')) return;
    try {
      const res = await fetch(getApiUrl(`/api/products/${id}`), {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      const data = await res.json();
      if (res.ok) {
        alert(data.message);
        fetchInventoryData();
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (err) {
      alert('Error al conectar con el servidor.');
    }
  };

  // Crear Categoría
  const handleSaveCategory = async (e) => {
    e.preventDefault();
    if (!catName) return;

    try {
      const res = await fetch(getApiUrl('/api/products/categories'), {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ name: catName, description: catDesc })
      });
      const data = await res.json();
      if (res.ok) {
        alert(data.message);
        setCategoryModal(false);
        setCatName('');
        setCatDesc('');
        fetchInventoryData();
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (err) {
      alert('Error al conectar con el servidor.');
    }
  };

  // Eliminar Categoría (Cascada)
  const handleDeleteCategory = async (id, name) => {
    const doubleCheck = window.confirm(
      `⚠️ ¡ADVERTENCIA DE CASCADA! ⚠️\n\n¿Estás seguro de eliminar la categoría "${name}"?\nEsta acción eliminará TODOS los repuestos pertenecientes a esta categoría de forma permanente.`
    );
    if (!doubleCheck) return;

    try {
      const res = await fetch(getApiUrl(`/api/products/categories/${id}`), {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      const data = await res.json();
      if (res.ok) {
        alert(data.message);
        fetchInventoryData();
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (err) {
      alert('Error al conectar con el servidor.');
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

  return (
    <CContainer className="py-4">
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
        <h2 className="text fw-bold m-0">Gestión de Inventario</h2>
        
        {activeTab === 'products' ? (
          <CButton onClick={openCreateProduct} className="btn-red d-flex align-items-center gap-1">
            <CIcon icon={cilPlus} /> Agregar Repuesto
          </CButton>
        ) : (
          <CButton onClick={() => setCategoryModal(true)} className="btn-red d-flex align-items-center gap-1">
            <CIcon icon={cilPlus} /> Nueva Categoría
          </CButton>
        )}
      </div>

      {/* Tabs */}
      <CNav variant="tabs" className="mb-4 border-secondary">
        <CNavItem>
          <CNavLink 
            style={{ cursor: 'pointer' }}
            active={activeTab === 'products'} 
            onClick={() => setActiveTab('products')}
            className={`text-uppercase font-semibold ${activeTab === 'products' ? 'text-white border-secondary bg-dark' : 'text-secondary'}`}
          >
            Repuestos
          </CNavLink>
        </CNavItem>
        <CNavItem>
          <CNavLink 
            style={{ cursor: 'pointer' }}
            active={activeTab === 'categories'} 
            onClick={() => setActiveTab('categories')}
            className={`text-uppercase font-semibold ${activeTab === 'categories' ? 'text-white border-secondary bg-dark' : 'text-secondary'}`}
          >
            Categorías
          </CNavLink>
        </CNavItem>
      </CNav>

      {loading ? (
        <div className="d-flex justify-content-center py-5">
          <CSpinner color="danger" variant="grow" />
        </div>
      ) : activeTab === 'products' ? (
        // TABLA PRODUCTOS
        <div className="glass-panel p-3 overflow-auto">
          <CTable align="middle" responsive borderless hover>
            <CTableHead>
              <CTableRow className="border-bottom border-secondary ">
                <CTableHeaderCell>ID</CTableHeaderCell>
                <CTableHeaderCell>Repuesto</CTableHeaderCell>
                <CTableHeaderCell>Categoría</CTableHeaderCell>
                <CTableHeaderCell className="text-end ">Precio</CTableHeaderCell>
                <CTableHeaderCell className="text-center">Stock</CTableHeaderCell>
                <CTableHeaderCell className="text-center">Acciones</CTableHeaderCell>
              </CTableRow>
            </CTableHead>
            <CTableBody>
              {products.map((prod) => (
                <CTableRow key={prod.id} className="border-bottom border-secondary">
                  <CTableDataCell className="text-secondary">{prod.id}</CTableDataCell>
                  <CTableDataCell>
                    <div className="d-flex align-items-center gap-3">
                      <img src={prod.image_url} alt={prod.name} width="40" height="40" className="rounded object-fit-cover" />
                      <div>
                        <span className="text- fw-bold d-block">{prod.name}</span>
                        <span className="text-muted small text-truncate d-inline-block" style={{ maxWidth: '300px' }}>{prod.description}</span>
                      </div>
                    </div>
                  </CTableDataCell>
                  <CTableDataCell>
                    <CBadge color="dark" style={{ border: '1px solid rgba(255,255,255,0.1)' }}>{prod.category_name}</CBadge>
                  </CTableDataCell>
                  <CTableDataCell className="text-end fw-semibold" style={{ color: 'var(--text-primary)' }}>{formatCOP(prod.price)}</CTableDataCell>
                  <CTableDataCell className="text-center">
                    {prod.stock > 5 ? (
                      <CBadge color="success">{prod.stock} u.</CBadge>
                    ) : prod.stock > 0 ? (
                      <CBadge color="warning">Bajo: {prod.stock} u.</CBadge>
                    ) : (
                      <CBadge color="danger">Agotado</CBadge>
                    )}
                  </CTableDataCell>
                  <CTableDataCell className="text-center">
                    <div className="d-flex justify-content-center gap-2">
                      <CButton size="sm" color="gray" onClick={() => openEditProduct(prod)} style={{ border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                        <CIcon icon={cilPencil} className="text-info" />
                      </CButton>
                      <CButton size="sm" color="gray" onClick={() => handleDeleteProduct(prod.id)} style={{ border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                        <CIcon icon={cilTrash} className="text-danger" />
                      </CButton>
                    </div>
                  </CTableDataCell>
                </CTableRow>
              ))}
            </CTableBody>
          </CTable>
        </div>
      ) : (
        // TABLA CATEGORIAS
        <div className="glass-panel p-3 overflow-auto">
          <CAlert color="warning" className="d-flex align-items-center gap-2 mb-4">
            <CIcon icon={cilWarning} size="lg" />
            <div>
              <strong>¡Aviso de Integridad Relacional (Cascada)!</strong> La eliminación de una categoría eliminará de forma automática e inmediata todos los productos que pertenezcan a ella.
            </div>
          </CAlert>

          <CTable align="middle" responsive borderless hover>
            <CTableHead>
              <CTableRow className="border-bottom border-secondary">
                <CTableHeaderCell>ID</CTableHeaderCell>
                <CTableHeaderCell>Categoría</CTableHeaderCell>
                <CTableHeaderCell>Descripción</CTableHeaderCell>
                <CTableHeaderCell className="text-center">Acciones</CTableHeaderCell>
              </CTableRow>
            </CTableHead>
            <CTableBody>
              {categories.map((cat) => (
                <CTableRow key={cat.id} className="border-bottom border-secondary">
                  <CTableDataCell style={{ color: 'var(--text-primary)' }}>{cat.id}</CTableDataCell>
                  <CTableDataCell style={{ color: 'var(--text-primary)', fontWeight: 700 }}>{cat.name}</CTableDataCell>
                  <CTableDataCell style={{ color: 'var(--text-primary)' }}>{cat.description || 'Sin descripción.'}</CTableDataCell>
                  <CTableDataCell className="text-center">
                    <CButton size="sm" color="dark" onClick={() => handleDeleteCategory(cat.id, cat.name)} style={{ border: '1px solid rgba(255,255,255,0.1)' }}>
                      <CIcon icon={cilTrash} className="text-danger" /> Eliminar
                    </CButton>
                  </CTableDataCell>
                </CTableRow>
              ))}
            </CTableBody>
          </CTable>
        </div>
      )}

      {/* MODAL PRODUCTO */}
      <CModal visible={productModal} onClose={() => setProductModal(false)} backdrop="static" alignment="center">
        <CModalHeader className="bg-dark text-white border-secondary">
          <CModalTitle>{editingProduct ? 'Editar Repuesto' : 'Agregar Nuevo Repuesto'}</CModalTitle>
        </CModalHeader>
        <CForm onSubmit={handleSaveProduct}>
          <CModalBody className="bg-dark text-white">
            <div className="mb-3">
              <label className="form-label">Nombre del Repuesto</label>
              <CFormInput required value={prodName} onChange={(e) => setProdName(e.target.value)} placeholder="Ej. Filtro de aire Yamaha R1" />
            </div>
            <div className="mb-3">
              <label className="form-label">Descripción</label>
              <CFormTextarea value={prodDesc} onChange={(e) => setProdDesc(e.target.value)} rows={3} placeholder="Detalles técnicos..." />
            </div>
            <CRow className="mb-3">
              <CCol>
                <label className="form-label">Precio (COP)</label>
                <CFormInput required type="number" value={prodPrice} onChange={(e) => setProdPrice(e.target.value)} placeholder="85000" />
              </CCol>
              <CCol>
                <label className="form-label">Stock Inicial</label>
                <CFormInput required type="number" value={prodStock} onChange={(e) => setProdStock(e.target.value)} placeholder="15" />
              </CCol>
            </CRow>
            <div className="mb-3">
              <label className="form-label">URL de Imagen</label>
              <CFormInput value={prodImg} onChange={(e) => setProdImg(e.target.value)} placeholder="https://..." />
            </div>
            <div className="mb-3">
              <label className="form-label">Categoría</label>
              <CFormSelect value={prodCatId} onChange={(e) => setProdCatId(e.target.value)}>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </CFormSelect>
            </div>
          </CModalBody>
          <CModalFooter className="bg-dark border-secondary">
            <CButton color="secondary" onClick={() => setProductModal(false)}>Cancelar</CButton>
            <CButton type="submit" className="btn-red">Guardar Repuesto</CButton>
          </CModalFooter>
        </CForm>
      </CModal>

      {/* MODAL CATEGORIA */}
      <CModal visible={categoryModal} onClose={() => setCategoryModal(false)} backdrop="static" alignment="center">
        <CModalHeader className="bg-dark text-white border-secondary">
          <CModalTitle>Nueva Categoría de Repuestos</CModalTitle>
        </CModalHeader>
        <CForm onSubmit={handleSaveCategory}>
          <CModalBody className="bg-dark text-white">
            <div className="mb-3">
              <label className="form-label">Nombre de Categoría</label>
              <CFormInput required value={catName} onChange={(e) => setCatName(e.target.value)} placeholder="Ej. Embragues, Suspensión" />
            </div>
            <div className="mb-3">
              <label className="form-label">Descripción</label>
              <CFormTextarea value={catDesc} onChange={(e) => setCatDesc(e.target.value)} rows={3} placeholder="Detalles de los componentes..." />
            </div>
          </CModalBody>
          <CModalFooter className="bg-dark border-secondary">
            <CButton color="secondary" onClick={() => setCategoryModal(false)}>Cancelar</CButton>
            <CButton type="submit" className="btn-red">Crear Categoría</CButton>
          </CModalFooter>
        </CForm>
      </CModal>
    </CContainer>
  );
};

export default Inventory;
