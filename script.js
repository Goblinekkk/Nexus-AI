const MASTER_KEY = "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"; 
let currentModel = "llama-3.3-70b-versatile";
let currentLang = "cs";
let messages = [];

// Sidebar Toggle
const sidebar = document.getElementById('sidebar');
const overlay = document.getElementById('overlay');
document.getElementById('menuBtn').onclick = () => { sidebar.classList.add('open'); overlay.style.display = 'block'; };
overlay.onclick = () => { sidebar.classList.remove('open'); overlay.style.display = 'none'; };

// Modely
document.querySelectorAll('.model-btn').forEach(btn => {
    btn.onclick = () => {
        document.querySelectorAll('.model-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentModel = btn.dataset.model;
    };
});

// Odesílání
async function sendMessage() {
    const input = document.getElementById('userInput');
    const text = input.value.trim();
    if (!text) return;

    // Skrýt úvod při první zprávě
    document.getElementById('welcomeScreen').style.display = 'none';
    
    // UI - Moje zpráva
    addBubble(text, 'user');
    input.value = "";
    
    const aiBubble = addBubble("...", 'ai');
    
    try {
        const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: { "Authorization": `Bearer ${MASTER_KEY}`, "Content-Type": "application/json" },
            body: JSON.stringify({
                messages: [{role: "system", content: currentLang === 'cs' ? "Mluv česky." : "Speak English."}, {role: "user", content: text}],
                model: currentModel
            })
        });
        const data = await res.json();
        aiBubble.innerText = data.choices[0].message.content;
        saveChat(text);
    } catch (e) { aiBubble.innerText = "Chyba spojení."; }
}

function addBubble(text, type) {
    const win = document.getElementById('chatWindow');
    const div = document.createElement('div');
    div.className = `msg ${type}-msg`;
    div.innerText = text;
    win.appendChild(div);
    win.scrollTop = win.scrollHeight;
    return div;
}

function saveChat(title) {
    let history = JSON.parse(localStorage.getItem('nexus_history') || '[]');
    if (!history.includes(title)) {
        history.unshift(title.substring(0, 30));
        localStorage.setItem('nexus_history', JSON.stringify(history.slice(0, 10)));
        renderHistory();
    }
}

function renderHistory() {
    const list = document.getElementById('chatHistoryList');
    const history = JSON.parse(localStorage.getItem('nexus_history') || '[]');
    list.innerHTML = history.map(h => `<div style="padding:10px; border-bottom:1px solid #eee; font-size:0.9rem; cursor:pointer;">${h}</div>`).join('');
}

document.getElementById('sendBtn').onclick = sendMessage;
document.getElementById('newChatBtn').onclick = () => location.reload();
renderHistory();
