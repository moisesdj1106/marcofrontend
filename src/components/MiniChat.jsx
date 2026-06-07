import React, { useState, useEffect, useRef } from 'react';
import './MiniChat.css';
import { getApiUrl } from '../utils/api';
import { useCart } from '../context/CartContext';

export default function MiniChat({ initialOpen = true }) {
  const [open, setOpen] = useState(initialOpen);
  const [messages, setMessages] = useState(() => {
    try {
      const saved = localStorage.getItem('miniChatMessages');
      return saved ? JSON.parse(saved) : [];
    } catch (e) { return []; }
  });
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);
  const { addToCart } = useCart();
  const [closed, setClosed] = useState(false);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, open]);

  // Persistir mensajes en localStorage
  useEffect(() => {
    try { localStorage.setItem('miniChatMessages', JSON.stringify(messages)); } catch (e) {}
  }, [messages]);

  useEffect(() => {
    // Mensaje de bienvenida con instrucciones claras
    // Añadir mensaje de bienvenida sólo si no hay historial previo
    if (!messages || messages.length === 0) {
      addMessage('bot', 'Hola 👋 Soy el asistente de la tienda. Puedo: listar productos, buscar por nombre, consultar stock, crear órdenes, reservar, guardar borradores y más.\nPulsa "?" arriba para ver todo lo que puedo hacer y ejemplos.\nEjemplos rápidos: "Productos disponibles", "Stock bujía ngk", "Comprar 2 Bujía NGK"');
    }
  }, []);

  // Escuchar evento de limpieza cuando el usuario hace logout
  useEffect(() => {
    const handler = () => {
      try {
        setMessages([]);
        localStorage.removeItem('miniChatMessages');
      } catch (e) {}
    };
    window.addEventListener('miniChatClear', handler);
    return () => window.removeEventListener('miniChatClear', handler);
  }, []);

  const [showHelp, setShowHelp] = useState(false);

  function parseOrderMessage(text) {
    const lower = text.toLowerCase();
    if (!/(comprar|quiero comprar|hacer pedido|hacer una orden)/.test(lower)) return [];
    const after = text.split(/comprar|quiero comprar|hacer pedido|hacer una orden/)[1] || '';
    const parts = after.split(/,| y |;|\band\b/).map(p => p.trim()).filter(Boolean);
    const items = [];
    for (const part of parts) {
      const idMatch = part.match(/(?:producto|marca|opci[oó]n|item|art[ií]culo)\s*#?\s*(\d+)\b/i);
      if (idMatch) {
        items.push({ product_id: parseInt(idMatch[1], 10), quantity: 1 });
        continue;
      }
      const m = part.match(/(\d+)\s+(.+)/); // '2 bujía ngk'
      if (m) {
        items.push({ name: m[2].trim(), quantity: parseInt(m[1], 10) });
        continue;
      }
      const m2 = part.match(/(.+?)\s+x?(\d+)$/); // 'Bujía NGK x2'
      if (m2) {
        items.push({ name: m2[1].trim(), quantity: parseInt(m2[2], 10) });
        continue;
      }
      // If only a name is present, default quantity 1
      if (part.length > 2) items.push({ name: part.trim(), quantity: 1 });
    }
    return items;
  }

  function addMessage(from, content) {
    setMessages((m) => [...m, { from, content, id: Date.now() + Math.random() }]);
  }

  async function send() {
    if (!input.trim()) return;
    const text = input.trim();
    addMessage('user', text);
    setInput('');
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const parsedOrder = parseOrderMessage(text);
      const bodyPayload = parsedOrder.length > 0 ? { message: text, orderItems: parsedOrder } : { message: text };
      const res = await fetch(getApiUrl('/api/chat'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(bodyPayload),
      });
      const data = await res.json();
      if (data.type === 'list') {
        const listHtml = data.items.map(it => `• ${it.name} — ${formatBs(it.price)} — stock: ${it.stock}`).join('\n');
        addMessage('bot', `${data.title}\n${listHtml}`);
      } else if (data.type === 'product') {
        const p = data.product;
        addMessage('bot', `${p.name} — ${formatBs(p.price)}\nStock: ${p.stock}\n${p.description || ''}`);
      } else if (data.type === 'stock') {
        addMessage('bot', `${data.product.name} — Stock: ${data.product.stock}`);
      } else if (data.type === 'order') {
        // Añadir items al carrito local para continuar el flujo de compra
        const items = data.items || [];
        for (const it of items) {
          // Construir objeto de producto esperable por addToCart
          const productObj = {
            id: it.product_id,
            name: it.name,
            price: it.unit_price,
            stock: it.stock || 0,
            image_url: it.image_url || ''
          };
          try {
            addToCart(productObj, it.quantity);
          } catch (e) {
            // ignorar errores locales
          }
        }
        const itemsText = items.map(i=> `• ${i.name} x${i.quantity}`).join('\n');
        addMessage('bot', `✅ ${data.message} — Orden ID: ${data.orderId} — Total: ${formatBs(data.total)}\n${itemsText}\nHe agregado estos artículos a tu carrito para que continúes con el flujo de compra.`);
      } else if (data.type === 'draft') {
        // draft guardado: agregar al carrito para revisión
        const items = data.items || [];
        for (const it of items) {
          const productObj = { id: it.product_id, name: it.name, price: it.unit_price, stock: it.stock || 0, image_url: it.image_url || '' };
          try { addToCart(productObj, it.quantity); } catch (e) {}
        }
        const itemsText = items.map(i=> `• ${i.name} x${i.quantity}`).join('\n');
        addMessage('bot', `📝 ${data.message} — Borrador ID: ${data.orderId} — Total: ${formatBs(data.total)}\n${itemsText}\nHe agregado estos artículos a tu carrito para que los revises.`);
      } else if (data.type === 'reservation') {
        const items = data.items || [];
        for (const it of items) {
          const productObj = { id: it.product_id, name: it.name, price: it.unit_price, stock: it.stock || 0, image_url: it.image_url || '' };
          try { addToCart(productObj, it.quantity); } catch (e) {}
        }
        const itemsText = items.map(i=> `• ${i.name} x${i.quantity}`).join('\n');
        addMessage('bot', `🔒 ${data.message} — Reserva ID: ${data.reservationId} — Expira: ${data.expiresAt}\n${itemsText}\nHe agregado los artículos reservados a tu carrito.`);
      } else if (data.type === 'admin_stats') {
        addMessage('bot', `📊 Hoy: ${formatBs(data.today.total)} (${data.today.orders} órdenes)\nAyer: ${formatBs(data.previous.total)} (${data.previous.orders} órdenes)\nMejora: ${data.improvement ?? 'N/D'}%`);
      } else if (data.type === 'my_orders') {
        if (!data.orders || data.orders.length === 0) {
          addMessage('bot', 'No tienes pedidos registrados en el historial.');
        } else {
          const ordersText = data.orders.map((order) => {
            const date = new Date(order.created_at).toLocaleString('es-VE');
            const items = (order.items || []).map((item) => `    • ${item.product_name} x${item.quantity}`).join('\n');
            return `Pedido ${order.id} — ${order.status} — ${formatBs(order.total_amount)}\nFecha: ${date}\nProductos:\n${items}`;
          }).join('\n\n');
          addMessage('bot', `Aquí está tu historial de pedidos:\n\n${ordersText}`);
        }
      } else if (data.type === 'text') {
        const content = data.content || JSON.stringify(data);
        // Si el backend devuelve SQL para crear company_info, mostrarlo en bloque
        if (data.sql) {
          addMessage('bot', content + '\nSQL sugerido:\n' + data.sql);
        } else {
          addMessage('bot', content);
        }
      } else {
        addMessage('bot', JSON.stringify(data));
      }
    } catch (err) {
      addMessage('bot', 'Error al comunicarse con el servidor.');
    } finally {
      setLoading(false);
    }
  }

  function formatBs(val) {
    try {
      const n = Number(val) || 0;
      return n.toLocaleString('es-VE') + ' Bs';
    } catch (e) { return `${val} Bs`; }
  }

  if (closed) {
    return (
      <div className="minichat-launcher" onClick={() => { setClosed(false); setOpen(true); }} title="Abrir asistente">Asistente</div>
    );
  }

  return (
    <div className={`minichat ${open ? 'open' : ''}`}>
      <div className="minichat-header">
        <div className="minichat-title" onClick={() => setOpen(!open)}>Asistente de la Tienda</div>
        <div style={{display:'flex', gap:8, alignItems:'center'}}>
          <button className="minichat-help-btn" title="Qué puedo hacer" onClick={() => setShowHelp(s => !s)}>?</button>
          <div className="minichat-toggle" onClick={() => setOpen(!open)}>{open ? '—' : '+'}</div>
          <button className="minichat-close-btn" title="Cerrar" onClick={() => setClosed(true)}>×</button>
        </div>
      </div>

      {open && (
        <div className="minichat-body">
          {showHelp && (
            <div className="minichat-help">
              <div className="help-title">Qué puedo hacer — ejemplos</div>
              <ul className="help-list">
                <li><b>Listar productos:</b> "Productos disponibles", "Mostrar productos de frenos"</li>
                <li><b>Buscar por nombre:</b> "Buscar bujía ngk", "¿Tienen batería Yuasa 12V?"</li>
                <li><b>Consultar stock:</b> "Stock bujía ngk", "¿Hay pastillas delanteras?"</li>
                <li><b>Comprar (por nombre):</b> "Comprar 2 Bujía NGK, 1 Batería Yuasa"</li>
                <li><b>Comprar por número:</b> "Comprar producto 1", "Comprar marca 2"</li>
                <li><b>Reservar/apartar:</b> "Reservar 2 Bujía NGK por 24 horas"</li>
                <li><b>Guardar borrador/presupuesto:</b> "Guardar presupuesto: 2 Bujía NGK"</li>
                <li><b>Historial personal:</b> "Mis pedidos", "Ver historial"</li>
                <li><b>Solicitar factura:</b> "Solicitar factura para pedido 12345"</li>
                <li><b>Consultas de empresa:</b> "Misión", "Visión", "Ubicación"</li>
                <li><b>Ayuda general:</b> "Ayuda", "¿Qué puedes hacer?"</li>
              </ul>
              <div className="help-examples">Ejemplos rápidos:
                {['Productos disponibles','Stock bujía ngk','Comprar 2 Bujía NGK','Reservar 1 Pastillas'].map((ex,i)=> (
                  <button key={i} className="help-chip" onClick={() => { setInput(ex); inputRef.current?.focus(); }}>{ex}</button>
                ))}
              </div>
            </div>
          )}
          <div className="minichat-messages">
            {messages.map(msg => (
              <div key={msg.id} className={`minichat-message ${msg.from}`}>
                <div className="minichat-message-content">{msg.content.split('\n').map((l,i)=> <div key={i}>{l}</div>)}</div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          <div className="minichat-input-row">
            <input ref={inputRef} value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>{ if(e.key==='Enter') send(); }} placeholder="Escribe tu pregunta o comando..." />
            <button onClick={send} disabled={loading}>{loading ? '...' : 'Enviar'}</button>
          </div>
        </div>
      )}
    </div>
  );
}
