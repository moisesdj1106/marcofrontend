import React, { useState, useEffect, useRef } from 'react';
import './MiniChat.css';
import { getApiUrl } from '../utils/api';

export default function MiniChat({ initialOpen = false }) {
  const [open, setOpen] = useState(initialOpen);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, open]);

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
      const res = await fetch(getApiUrl('/api/chat'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ message: text }),
      });
      const data = await res.json();
      if (data.type === 'list') {
        const listHtml = data.items.map(it => `• ${it.name} — $${it.price} — stock: ${it.stock}`).join('\n');
        addMessage('bot', `${data.title}\n${listHtml}`);
      } else if (data.type === 'product') {
        const p = data.product;
        addMessage('bot', `${p.name} — $${p.price}\nStock: ${p.stock}\n${p.description || ''}`);
      } else if (data.type === 'stock') {
        addMessage('bot', `${data.product.name} — Stock: ${data.product.stock}`);
      } else if (data.type === 'order') {
        addMessage('bot', `✅ ${data.message} — Orden ID: ${data.orderId} — Total: ${data.total}`);
      } else if (data.type === 'admin_stats') {
        addMessage('bot', `📊 Hoy: $${data.today.total} (${data.today.orders} órdenes)\nAyer: $${data.previous.total} (${data.previous.orders} órdenes)\nMejora: ${data.improvement ?? 'N/D'}%`);
      } else if (data.type === 'text') {
        const content = data.content || JSON.stringify(data);
        addMessage('bot', content);
      } else {
        addMessage('bot', JSON.stringify(data));
      }
    } catch (err) {
      addMessage('bot', 'Error al comunicarse con el servidor.');
    } finally {
      setLoading(false);
    }
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
