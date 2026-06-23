(function () {
  const API_URL = 'https://ai-event-chat.vercel.app/api/chat';

  const styles = `
    @keyframes aie-pulse {
      0%   { box-shadow: 0 0 0 0 rgba(221,251,72,0.5); }
      70%  { box-shadow: 0 0 0 14px rgba(221,251,72,0); }
      100% { box-shadow: 0 0 0 0 rgba(221,251,72,0); }
    }
    @keyframes aie-orbit {
      from { transform: rotate(0deg) translateX(10px) rotate(0deg); }
      to   { transform: rotate(360deg) translateX(10px) rotate(-360deg); }
    }
    @keyframes aie-blink {
      0%, 100% { opacity: 1; } 50% { opacity: 0.3; }
    }

    #aie-toggle {
      position: fixed; bottom: 24px; left: 24px; z-index: 9999;
      width: 56px; height: 56px; border-radius: 50%;
      background: #ddfb48; border: none;
      cursor: pointer; display: flex; align-items: center; justify-content: center;
      animation: aie-pulse 2.4s ease-out infinite;
      transition: transform 0.2s;
    }
    #aie-toggle:hover { transform: scale(1.1); }
    #aie-toggle svg { width: 26px; height: 26px; fill: #1a1a1a; }

    #aie-window {
      position: fixed; bottom: 92px; left: 24px; z-index: 9999;
      width: 350px; height: 510px;
      background: #1a1a1a; border: 1px solid #2a2a2a; border-radius: 20px;
      display: none; flex-direction: column;
      box-shadow: 0 8px 40px rgba(0,0,0,0.6), 0 0 0 1px rgba(221,251,72,0.08);
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      overflow: hidden;
    }
    #aie-window.open { display: flex; }

    #aie-header {
      padding: 14px 18px; background: #111;
      border-bottom: 1px solid #222;
      display: flex; align-items: center; gap: 12px;
    }
    #aie-avatar {
      width: 36px; height: 36px; border-radius: 50%; flex-shrink: 0;
      background: #ddfb48; display: flex; align-items: center; justify-content: center;
      position: relative;
    }
    #aie-avatar svg { width: 20px; height: 20px; fill: #1a1a1a; }
    #aie-avatar::after {
      content: ''; position: absolute; bottom: 1px; right: 1px;
      width: 9px; height: 9px; border-radius: 50%;
      background: #4ade80; border: 2px solid #111;
      animation: aie-blink 2s ease-in-out infinite;
    }
    #aie-header-text { flex: 1; }
    #aie-header-text strong { display: block; color: #fff; font-size: 14px; font-weight: 600; }
    #aie-header-text small { color: #ddfb48; font-size: 11px; }
    #aie-close {
      background: none; border: none; cursor: pointer;
      color: #555; font-size: 18px; line-height: 1; padding: 4px;
      margin-left: auto;
    }
    #aie-close:hover { color: #fff; }

    #aie-messages {
      flex: 1; overflow-y: auto; padding: 16px;
      display: flex; flex-direction: column; gap: 12px;
    }
    #aie-messages::-webkit-scrollbar { width: 4px; }
    #aie-messages::-webkit-scrollbar-track { background: transparent; }
    #aie-messages::-webkit-scrollbar-thumb { background: #2a2a2a; border-radius: 2px; }

    .aie-msg {
      max-width: 85%; padding: 10px 14px;
      border-radius: 14px; font-size: 14px; line-height: 1.55;
      word-break: break-word;
    }
    .aie-msg.bot {
      background: #222; color: #e0e0e0;
      align-self: flex-start; border-bottom-left-radius: 4px;
    }
    .aie-msg.user {
      background: #ddfb48; color: #1a1a1a;
      align-self: flex-end; border-bottom-right-radius: 4px;
      font-weight: 500;
    }
    .aie-msg.typing { color: #555; font-style: italic; }

    #aie-footer {
      padding: 12px 14px; border-top: 1px solid #222;
      display: flex; gap: 8px;
    }
    #aie-input {
      flex: 1; background: #222; border: 1px solid #333;
      border-radius: 12px; padding: 10px 14px;
      color: #fff; font-size: 14px; outline: none;
      resize: none; height: 40px; line-height: 20px;
      font-family: inherit;
    }
    #aie-input::placeholder { color: #555; }
    #aie-input:focus { border-color: #ddfb48; }
    #aie-send {
      background: #ddfb48; border: none; border-radius: 12px;
      width: 40px; height: 40px; cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0; transition: background 0.2s, transform 0.1s;
    }
    #aie-send:hover { background: #c8e620; transform: scale(1.05); }
    #aie-send:disabled { background: #2a2a2a; cursor: default; transform: none; }
    #aie-send svg { width: 18px; height: 18px; fill: #1a1a1a; }
    #aie-send:disabled svg { fill: #555; }
  `;

  function injectStyles() {
    const tag = document.createElement('style');
    tag.textContent = styles;
    document.head.appendChild(tag);
  }

  function buildWidget() {
    document.body.insertAdjacentHTML('beforeend', `
      <div id="aie-toggle" title="Задать вопрос">
        <svg viewBox="0 0 24 24"><path d="M12 2a1 1 0 0 1 .894.553l2.184 4.371 4.868.707a1 1 0 0 1 .554 1.706l-3.52 3.432.831 4.846a1 1 0 0 1-1.45 1.054L12 16.347l-4.361 2.322a1 1 0 0 1-1.45-1.054l.831-4.846L3.5 9.337a1 1 0 0 1 .554-1.706l4.868-.707L11.106 2.553A1 1 0 0 1 12 2z"/></svg>
      </div>
      <div id="aie-window">
        <div id="aie-header">
          <div id="aie-avatar">
            <svg viewBox="0 0 24 24"><path d="M12 2a1 1 0 0 1 .894.553l2.184 4.371 4.868.707a1 1 0 0 1 .554 1.706l-3.52 3.432.831 4.846a1 1 0 0 1-1.45 1.054L12 16.347l-4.361 2.322a1 1 0 0 1-1.45-1.054l.831-4.846L3.5 9.337a1 1 0 0 1 .554-1.706l4.868-.707L11.106 2.553A1 1 0 0 1 12 2z"/></svg>
          </div>
          <div id="aie-header-text">
            <strong>AI Ассистент</strong>
            <small>онлайн</small>
          </div>
          <button id="aie-close">✕</button>
        </div>
        <div id="aie-messages"></div>
        <div id="aie-footer">
          <textarea id="aie-input" placeholder="Задайте вопрос..." rows="1"></textarea>
          <button id="aie-send">
            <svg viewBox="0 0 24 24"><path d="M2 21l21-9L2 3v7l15 2-15 2z"/></svg>
          </button>
        </div>
      </div>
    `);
  }

  let history = [];
  let isLoading = false;

  function addMessage(text, role) {
    const el = document.createElement('div');
    el.className = 'aie-msg ' + role;
    el.textContent = text;
    const msgs = document.getElementById('aie-messages');
    msgs.appendChild(el);
    msgs.scrollTop = msgs.scrollHeight;
    return el;
  }

  async function sendMessage() {
    if (isLoading) return;
    const input = document.getElementById('aie-input');
    const message = input.value.trim();
    if (!message) return;

    input.value = '';
    input.style.height = '40px';
    addMessage(message, 'user');

    isLoading = true;
    document.getElementById('aie-send').disabled = true;
    const typingEl = addMessage('Печатает…', 'bot typing');

    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, history: history.slice(-10) })
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Ошибка сервера');
      }
      const data = await res.json();
      const reply = data.reply || 'Ошибка. Попробуйте ещё раз.';
      typingEl.remove();
      addMessage(reply, 'bot');
      history.push({ role: 'user', content: message });
      history.push({ role: 'assistant', content: reply });
    } catch (e) {
      typingEl.remove();
      addMessage(e.message || 'Не удалось получить ответ. Проверьте соединение.', 'bot');
    }

    isLoading = false;
    document.getElementById('aie-send').disabled = false;
    input.focus();
  }

  function bindEvents() {
    document.getElementById('aie-toggle').addEventListener('click', () => {
      const win = document.getElementById('aie-window');
      const isOpen = win.classList.toggle('open');
      if (isOpen && document.getElementById('aie-messages').children.length === 0) {
        addMessage('Привет! Я помогу вам разобраться с нашими продуктами. Задайте любой вопрос.', 'bot');
      }
      if (isOpen) setTimeout(() => document.getElementById('aie-input').focus(), 100);
    });

    document.getElementById('aie-close').addEventListener('click', () => {
      document.getElementById('aie-window').classList.remove('open');
    });

    document.getElementById('aie-send').addEventListener('click', sendMessage);

    document.getElementById('aie-input').addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    });
  }

  function init() {
    injectStyles();
    buildWidget();
    bindEvents();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
