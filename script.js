const MASTER_KEY = "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"; 
let currentModel = "llama-3.3-70b-versatile";
let currentLang = "cs";
let isFirstMessage = true;

const sidebar = document.getElementById('sidebar');
const overlay = document.getElementById('overlay');
const chatContainer = document.querySelector('.chat-container');

const toggleMenu = (open) => {
    sidebar.classList.toggle('open', open);
    overlay.style.display = open ? 'block' : 'none';
};

document.getElementById('menuBtn').onclick = () => toggleMenu(true);
overlay.onclick = () => toggleMenu(false);
document.getElementById('closeBtn').onclick = () => toggleMenu(false);

function switchLang(l) {
    currentLang = l;
    document.querySelectorAll('.lang-switch span').forEach(s => s.classList.remove('active'));
    document.getElementById('lang' + l.toUpperCase()).classList.add('active');
    
    document.getElementById('mainTitle').innerText = l === 'cs' ? "Co dnes vytvoříme?" : "What shall we create?";
    document.getElementById('userInput').placeholder = l === 'cs' ? "Napiš zprávu..." : "Type a message...";
    document.getElementById('histTitle').innerText = l === 'cs' ? "Knihovna" : "Library";
    document.getElementById('newChatBtn').innerText = l === 'cs' ? "+ Nový chat" : "+ New chat";
    document.getElementById('clearAllBtn').innerText = l === 'cs' ? "Smazat historii" : "Clear history";
}

document.getElementById('langCS').onclick = () => switchLang('cs');
document.getElementById('langEN').onclick = () => switchLang('en');

function scrollToBottom() {
    setTimeout(() => {
        chatContainer.scrollTo({ top: chatContainer.scrollHeight, behavior: 'smooth' });
    }, 50);
}

async function sendMessage() {
    const inputField = document.getElementById('userInput');
    const text = inputField.value.trim();
    if (!text) return;

    if (isFirstMessage) {
        document.getElementById('welcomeScreen').style.display = 'none';
        updateHistory(text);
        isFirstMessage = false;
    }

    addBubble(text, 'user');
    inputField.value = "";
    inputField.style.height = 'auto';
    
    const aiBubble = addBubble(currentLang === 'cs' ? "Luvyx přemýšlí..." : "Luvyx thinking...", 'ai');
    scrollToBottom();

    try {
        const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: { "Authorization": `Bearer ${MASTER_KEY}`, "Content-Type": "application/json" },
            body: JSON.stringify({
                messages: [
                    {role: "system", content: currentLang === 'cs' ? "Jsi Luvyx AI. Odpovídej česky a k věci." : "You are Luvyx AI. Be direct."},
                    {role: "user", content: text}
                ],
                model: currentModel
            })
        });
        const data = await res.json();
        aiBubble.innerText = data.choices[0].message.content;
        scrollToBottom();
    } catch (e) { aiBubble.innerText = "Chyba."; }
}

function addBubble(t, type) {
    const win = document.getElementById('chatWindow');
    const div = document.createElement('div');
    div.className = `msg ${type}-msg`;
    div.innerText = t;
    win.appendChild(div);
    return div;
}

function updateHistory(text) {
    let history = JSON.parse(localStorage.getItem('luvyx_hist') || '[]');
    const title = text.substring(0, 22) + "...";
    if(!history.includes(title)) {
        history.unshift(title);
        localStorage.setItem('luvyx_hist', JSON.stringify(history.slice(0, 10)));
        renderHistory();
    }
}

function renderHistory() {
    const list = document.getElementById('chatHistoryList');
    const history = JSON.parse(localStorage.getItem('luvyx_hist') || '[]');
    list.innerHTML = history.map(h => `<div style="padding:15px 10px; border-bottom:1px solid #f4f4f5; font-size:0.85rem; color:#888;">${h}</div>`).join('');
}

document.getElementById('clearAllBtn').onclick = () => {
    if(confirm("Smazat?")) { localStorage.removeItem('luvyx_hist'); renderHistory(); }
};

document.getElementById('sendBtn').onclick = sendMessage;
document.getElementById('newChatBtn').onclick = () => location.reload();
document.getElementById('userInput').oninput = function() { this.style.height = 'auto'; this.style.height = (this.scrollHeight) + 'px'; };
document.getElementById('userInput').onkeydown = (e) => { if(e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } };

renderHistory();
