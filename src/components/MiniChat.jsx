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
  const { addToCart } = useCart();

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
      addMessage('bot', 'Hola 👋 Soy el asistente de la tienda. Puedo: listar productos disponibles, buscar por nombre, consultar stock, y crear órdenes.\nEjemplos:\n• "Productos disponibles"\n• "Stock bujía ngk"\n• "Comprar 2 Bujía NGK, 1 Batería Yuasa"\nSi vas a crear una orden, simplemente escribe "Comprar" seguido de las cantidades y nombres. Yo me encargo de buscar los productos y completar la orden si estás autenticado.');
    }
  }, []);

  function parseOrderMessage(text) {
    const lower = text.toLowerCase();
    if (!/(comprar|quiero comprar|hacer pedido|hacer una orden)/.test(lower)) return [];
    const after = text.split(/comprar|quiero comprar|hacer pedido|hacer una orden/)[1] || '';
    const parts = after.split(/,| y |;|\band\b/).map(p => p.trim()).filter(Boolean);
    const items = [];
    for (const part of parts) {
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

  return (
    <div className={`minichat ${open ? 'open' : ''}`}>
      <div className="minichat-header" onClick={() => setOpen(!open)}>
        <div className="minichat-title">Asistente de la Tienda</div>
        <div className="minichat-toggle">{open ? '—' : '+'}</div>
      </div>

      {open && (
        <div className="minichat-body">
          <div className="minichat-messages">
            {messages.map(msg => (
              <div key={msg.id} className={`minichat-message ${msg.from}`}>
                <div className="minichat-message-content">{msg.content.split('\n').map((l,i)=> <div key={i}>{l}</div>)}</div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          <div className="minichat-input-row">
            <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>{ if(e.key==='Enter') send(); }} placeholder="Escribe tu pregunta o comando..." />
            <button onClick={send} disabled={loading}>{loading ? '...' : 'Enviar'}</button>
          </div>
        </div>
      )}
    </div>
  );
}
