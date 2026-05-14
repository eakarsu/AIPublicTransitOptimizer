import React, { useState, useRef, useEffect } from 'react';
import { Sidebar } from './Dashboard';
import { aiAPI } from '../services/api';
import AIResult from '../components/AIResult';

export default function RiderChatPage({ onLogout }) {
  const [messages, setMessages] = useState([
    { id: 1, role: 'assistant', content: 'Hello! I\'m your AI transit assistant. Ask me about routes, schedules, stops, or how to get from point A to point B.' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg = { id: Date.now(), role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    const q = input;
    setInput('');
    setLoading(true);

    try {
      const res = await aiAPI.riderChat({ query: q });
      const content = res.data.success ? res.data.content : (res.data.error || 'Sorry, I could not process your request.');
      setMessages(prev => [...prev, { id: Date.now() + 1, role: 'assistant', content }]);
    } catch (err) {
      setMessages(prev => [...prev, { id: Date.now() + 1, role: 'assistant', content: 'Sorry, an error occurred. Please try again.' }]);
    } finally {
      setLoading(false);
    }
  };

  const SUGGESTIONS = [
    'How do I get from downtown to the airport?',
    'What are the peak hours on Route 5?',
    'Which stops have shelter and seating?',
    'What bus routes run on weekends?',
  ];

  return (
    <div className="layout">
      <Sidebar onLogout={onLogout} user={user} active="rider-chat" />
      <div className="main-content" style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
        <div className="page-header" style={{ flexShrink: 0 }}>
          <h1>Rider Chat</h1>
          <p style={{ color: '#94a3b8', marginTop: 4 }}>AI journey planner powered by real transit data</p>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '0 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          {messages.map(msg => (
            <div key={msg.id} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
              <div style={{
                maxWidth: '75%',
                padding: '12px 16px',
                borderRadius: msg.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                background: msg.role === 'user' ? '#3b82f6' : '#1e293b',
                color: 'white',
                fontSize: 14,
                lineHeight: 1.6,
                whiteSpace: 'pre-wrap',
              }}>
                {msg.role === 'assistant' && <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 4 }}>Transit AI</div>}
                {msg.content}
              </div>
            </div>
          ))}
          {loading && (
            <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
              <div style={{ padding: '12px 16px', borderRadius: '18px 18px 18px 4px', background: '#1e293b', color: '#94a3b8', fontSize: 14 }}>
                Thinking...
              </div>
            </div>
          )}
          <div ref={endRef} />
        </div>

        <div style={{ flexShrink: 0, padding: '16px 24px', borderTop: '1px solid #334155' }}>
          <div style={{ display: 'flex', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
            {SUGGESTIONS.map((s, i) => (
              <button key={i} onClick={() => setInput(s)} style={{ padding: '4px 10px', background: '#1e293b', border: '1px solid #334155', borderRadius: 12, color: '#94a3b8', fontSize: 12, cursor: 'pointer' }}>
                {s}
              </button>
            ))}
          </div>
          <form onSubmit={handleSend} style={{ display: 'flex', gap: 8 }}>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Ask about routes, stops, schedules..."
              style={{ flex: 1, padding: '10px 14px', background: '#1e293b', border: '1px solid #334155', borderRadius: 8, color: 'white', fontSize: 14 }}
              disabled={loading}
            />
            <button type="submit" disabled={loading || !input.trim()}
              style={{ padding: '10px 20px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}>
              Send
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
