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
      position: fixed; bottom: 90px; left: 15px; z-index: 9999;
      width: 56px; height: 56px; border-radius: 50%;
      background: #ddfb48; border: none;
      cursor: pointer; display: flex; align-items: center; justify-content: center;
      animation: aie-pulse 2.4s ease-out infinite;
      transition: transform 0.2s;
    }
    #aie-toggle:hover { transform: scale(1.1); }
    #aie-toggle svg { width: 26px; height: 26px; fill: #1a1a1a; }

    #aie-window {
      position: fixed; bottom: 158px; left: 15px; z-index: 9999;
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
    .aie-msg.bot strong { color: #ddfb48; font-weight: 600; }
    .aie-msg.bot a { color: #ddfb48; text-decoration: underline; word-break: break-all; }
    .aie-msg.bot a:hover { opacity: 0.8; }
    .aie-li { display: flex; gap: 8px; margin: 3px 0; }
    .aie-li-num { color: #ddfb48; font-weight: 600; flex-shrink: 0; min-width: 18px; }
    .aie-li-bullet { color: #ddfb48; flex-shrink: 0; }
    .aie-br { height: 6px; }

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

    #aie-lead-btn {
      width: 100%; background: none; border: 1px solid #333;
      border-radius: 12px; padding: 10px; margin: 4px 0 0;
      color: #ddfb48; font-size: 13px; cursor: pointer;
      font-family: inherit; transition: background 0.2s;
    }
    #aie-lead-btn:hover { background: rgba(221,251,72,0.07); }

    #aie-lead-form {
      position: absolute; inset: 0; background: #1a1a1a;
      display: none; flex-direction: column;
      padding: 24px 20px; gap: 12px; z-index: 2;
    }
    #aie-lead-form.open { display: flex; }
    #aie-lead-form h3 { color: #fff; font-size: 16px; margin: 0; }
    #aie-lead-form p { color: #888; font-size: 13px; margin: 0; line-height: 1.4; }
    .aie-field {
      background: #222; border: 1px solid #333; border-radius: 12px;
      padding: 12px 14px; color: #fff; font-size: 14px;
      outline: none; font-family: inherit; width: 100%; box-sizing: border-box;
    }
    .aie-field::placeholder { color: #555; }
    .aie-field:focus { border-color: #ddfb48; }
    #aie-lead-submit {
      background: #ddfb48; border: none; border-radius: 12px;
      padding: 12px; color: #1a1a1a; font-size: 14px; font-weight: 600;
      cursor: pointer; font-family: inherit; transition: background 0.2s;
    }
    #aie-lead-submit:hover { background: #c8e620; }
    #aie-lead-submit:disabled { background: #333; color: #666; cursor: default; }
    #aie-lead-back {
      background: none; border: none; color: #555; font-size: 13px;
      cursor: pointer; font-family: inherit; padding: 0;
    }
    #aie-lead-back:hover { color: #fff; }
    #aie-lead-success { color: #ddfb48; font-size: 15px; text-align: center; margin: auto 0; }
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
        <div id="aie-lead-form">
          <h3>Оставить контакт</h3>
          <p>Стас напишет вам и ответит на все вопросы по мероприятию</p>
          <input class="aie-field" id="aie-lead-name" placeholder="Ваше имя" type="text" maxlength="100">
          <input class="aie-field" id="aie-lead-contact" placeholder="Telegram или телефон" type="text" maxlength="100">
          <button id="aie-lead-submit">Отправить</button>
          <button id="aie-lead-back">← Вернуться к чату</button>
        </div>
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
        <div style="padding: 0 14px 12px;">
          <button id="aie-lead-btn">📋 Оставить контакт — Стас напишет вам</button>
        </div>
      </div>
    `);
  }

  let history = [];
  let isLoading = false;

  function renderMarkdown(text) {
    const escaped = text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    return escaped
      // Markdown links: [text](url)
      .replace(/\[([^\]]+)\]\((https?:\/\/[^\)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>')
      // Plain URLs: https://...
      .replace(/(^|[\s(])(https?:\/\/[^\s<)"]+)/g, '$1<a href="$2" target="_blank" rel="noopener">$2</a>')
      // Bold: **text**
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      // Numbered list items
      .replace(/^(\d+)\.\s+(.+)$/gm, '<div class="aie-li"><span class="aie-li-num">$1.</span><span>$2</span></div>')
      // Bullet list items
      .replace(/^[-•]\s+(.+)$/gm, '<div class="aie-li"><span class="aie-li-bullet">•</span><span>$1</span></div>')
      // Double newline → paragraph break
      .replace(/\n\n/g, '<div class="aie-br"></div>')
      // Single newline → line break
      .replace(/\n/g, '<br>');
  }

  function addMessage(text, role) {
    const el = document.createElement('div');
    el.className = 'aie-msg ' + role;
    if (role === 'bot') {
      el.innerHTML = renderMarkdown(text);
    } else {
      el.textContent = text;
    }
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

    document.getElementById('aie-lead-btn').addEventListener('click', () => {
      document.getElementById('aie-lead-form').classList.add('open');
      document.getElementById('aie-lead-name').focus();
    });

    document.getElementById('aie-lead-back').addEventListener('click', () => {
      document.getElementById('aie-lead-form').classList.remove('open');
    });

    document.getElementById('aie-lead-submit').addEventListener('click', async () => {
      const name = document.getElementById('aie-lead-name').value.trim();
      const contact = document.getElementById('aie-lead-contact').value.trim();
      if (!contact) {
        document.getElementById('aie-lead-contact').focus();
        return;
      }

      const btn = document.getElementById('aie-lead-submit');
      btn.disabled = true;
      btn.textContent = 'Отправляем…';

      const NOTIFY_URL = API_URL.replace('/api/chat', '/api/notify');

      try {
        await fetch(NOTIFY_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, contact, history })
        });
        const form = document.getElementById('aie-lead-form');
        form.innerHTML = '<div id="aie-lead-success">✅ Готово! Стас скоро напишет вам.</div><button id="aie-lead-back2" style="background:none;border:none;color:#555;font-size:13px;cursor:pointer;font-family:inherit;margin-top:auto;">← Вернуться к чату</button>';
        document.getElementById('aie-lead-back2').addEventListener('click', () => {
          form.classList.remove('open');
        });
      } catch {
        btn.disabled = false;
        btn.textContent = 'Попробовать ещё раз';
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
