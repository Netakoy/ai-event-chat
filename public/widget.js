(function () {
  const API_URL = 'https://VERCEL_URL_PLACEHOLDER/api/chat';

  const styles = `
    #aie-toggle {
      position: fixed; bottom: 24px; right: 24px; z-index: 9999;
      width: 56px; height: 56px; border-radius: 50%;
      background: #1a1a1a; border: 1px solid #333;
      cursor: pointer; display: flex; align-items: center; justify-content: center;
      box-shadow: 0 4px 20px rgba(0,0,0,0.4);
      transition: transform 0.2s;
    }
    #aie-toggle:hover { transform: scale(1.08); }
    #aie-toggle svg { width: 24px; height: 24px; fill: #fff; }

    #aie-window {
      position: fixed; bottom: 92px; right: 24px; z-index: 9999;
      width: 350px; height: 500px;
      background: #1a1a1a; border: 1px solid #333; border-radius: 16px;
      display: none; flex-direction: column;
      box-shadow: 0 8px 40px rgba(0,0,0,0.5);
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      overflow: hidden;
    }
    #aie-window.open { display: flex; }

    #aie-header {
      padding: 16px 20px; background: #111;
      border-bottom: 1px solid #333;
      display: flex; align-items: center; justify-content: space-between;
    }
    #aie-header span { color: #fff; font-size: 15px; font-weight: 600; }
    #aie-close {
      background: none; border: none; cursor: pointer;
      color: #888; font-size: 20px; line-height: 1; padding: 0;
    }
    #aie-close:hover { color: #fff; }

    #aie-messages {
      flex: 1; overflow-y: auto; padding: 16px;
      display: flex; flex-direction: column; gap: 12px;
    }
    #aie-messages::-webkit-scrollbar { width: 4px; }
    #aie-messages::-webkit-scrollbar-track { background: transparent; }
    #aie-messages::-webkit-scrollbar-thumb { background: #333; border-radius: 2px; }

    .aie-msg {
      max-width: 85%; padding: 10px 14px;
      border-radius: 12px; font-size: 14px; line-height: 1.5;
      word-break: break-word;
    }
    .aie-msg.bot {
      background: #2a2a2a; color: #e5e5e5;
      align-self: flex-start; border-bottom-left-radius: 4px;
    }
    .aie-msg.user {
      background: #6366f1; color: #fff;
      align-self: flex-end; border-bottom-right-radius: 4px;
    }
    .aie-msg.typing { color: #666; font-style: italic; }

    #aie-footer {
      padding: 12px 16px; border-top: 1px solid #333;
      display: flex; gap: 8px;
    }
    #aie-input {
      flex: 1; background: #2a2a2a; border: 1px solid #444;
      border-radius: 10px; padding: 10px 14px;
      color: #fff; font-size: 14px; outline: none;
      resize: none; height: 40px; line-height: 20px;
      font-family: inherit;
    }
    #aie-input::placeholder { color: #666; }
    #aie-input:focus { border-color: #6366f1; }
    #aie-send {
      background: #6366f1; border: none; border-radius: 10px;
      width: 40px; height: 40px; cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0; transition: background 0.2s;
    }
    #aie-send:hover { background: #5254cc; }
    #aie-send:disabled { background: #333; cursor: default; }
    #aie-send svg { width: 18px; height: 18px; fill: #fff; }
  `;

  function injectStyles() {
    const tag = document.createElement('style');
    tag.textContent = styles;
    document.head.appendChild(tag);
  }

  function buildWidget() {
    document.body.insertAdjacentHTML('beforeend', `
      <div id="aie-toggle" title="Задать вопрос">
        <svg viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/></svg>
      </div>
      <div id="aie-window">
        <div id="aie-header">
          <span>Ассистент</span>
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
