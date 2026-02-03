const MASTER_KEY = "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"; 
let currentModel = "llama-3.3-70b-versatile";
let currentLang = "cs";
let isFirstMessage = true;

const sidebar = document.getElementById('sidebar');
const overlay = document.getElementById('overlay');
const chatContainer = document.querySelector('.chat-container');

// Sidebar logic
document.getElementById('menuBtn').onclick = () => { sidebar.classList.add('open'); overlay.style.display = 'block'; };
const closeMenu = () => { sidebar.classList.remove('open'); overlay.style.display = 'none'; };
overlay.onclick = closeMenu;
document.getElementById('closeBtn').onclick = closeMenu;

// Lang logic
document.getElementById('langCS').onclick = () => switchLang('cs');
document.getElementById('langEN').onclick = () => switchLang('en');

function switchLang(l) {
    currentLang = l;
    document.getElementById('langCS').classList.toggle('active', l === 'cs');
    document.getElementById('langEN').classList.toggle('active', l === 'en');
    document.getElementById('mainTitle').innerText = l === 'cs' ? "Co dnes vytvoříme?" : "What shall we create?";
    document.getElementById('userInput').placeholder = l === 'cs' ? "Napiš zprávu..." : "Type a message...";
    document.getElementById('histTitle').innerText = l === 'cs' ? "Historie" : "History";
    document.getElementById('newChatBtn').innerText = l === 'cs' ? "+ Nový chat" : "+ New chat";
    document.getElementById('clearAllBtn').innerText = l === 'cs' ? "Vymazat historii" : "Clear history";
}

// Scroll logic
function scrollToBottom() {
    chatContainer.scrollTo({
        top: chatContainer.scrollHeight,
        behavior: 'smooth'
    });
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
    inputField.style.height = '40px'; // Reset výšky textarey
    
    const aiBubble = addBubble(currentLang === 'cs' ? "Nexus přemýšlí..." : "Nexus thinking...", 'ai');
    scrollToBottom();

    try {
        const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: { "Authorization": `Bearer ${MASTER_KEY}`, "Content-Type": "application/json" },
            body: JSON.stringify({
                messages: [
                    {role: "system", content: currentLang === 'cs' ? "Stručná odpověď v češtině." : "Short answer in English."},
                    {role: "user", content: text}
                ],
                model: currentModel
            })
        });
        const data = await res.json();
        aiBubble.innerText = data.choices[0].message.content;
        scrollToBottom();
    } catch (e) { aiBubble.innerText = "Chyba spojení."; }
}

function addBubble(t, type) {
    const win = document.getElementById('chatWindow');
    const div = document.createElement('div');
    div.className = `msg ${type}-msg`;
    div.innerText = t;
    win.appendChild(div);
    return div;
}

// ... (zbytek funkcí pro historii a modely zůstává stejný jako ve v1.8)

document.getElementById('sendBtn').onclick = sendMessage;
document.getElementById('newChatBtn').onclick = () => location.reload();
document.getElementById('userInput').onkeydown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
};

// Automatické zvětšování textarey
document.getElementById('userInput').oninput = function() {
    this.style.height = 'auto';
    this.style.height = (this.scrollHeight) + 'px';
};
