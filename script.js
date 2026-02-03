let currentModel = "llama-3.3-70b-versatile";
const API_URL = "https://api.groq.com/openai/v1/chat/completions";
const MASTER_KEY = "VLOZ_SEM_SVUJ_GROQ_KLIC"; 

// Logika přepínání tlačítek
document.querySelectorAll('.model-btn').forEach(btn => {
    btn.onclick = () => {
        document.querySelectorAll('.model-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentModel = btn.dataset.model;
    };
});

// Odesílání dotazu
document.getElementById('sendBtn').onclick = async () => {
    const inputField = document.getElementById('userInput');
    const input = inputField.value.trim();
    const responseArea = document.getElementById('responseArea');
    
    if (!input) return;

    // Příprava UI
    const startTime = performance.now();
    responseArea.innerHTML = `<p style="opacity:0.5; font-style: italic;">Nexus AI povolává ${currentModel}...</p>`;
    inputField.value = ""; // Vyčistit pole

    try {
        const res = await fetch(API_URL, {
            method: "POST",
            headers: { 
                "Authorization": `Bearer ${MASTER_KEY}`, 
                "Content-Type": "application/json" 
            },
            body: JSON.stringify({
                messages: [{role: "user", content: input}],
                model: currentModel,
                temperature: 0.7
            })
        });

        const data = await res.json();
        const endTime = performance.now();
        
        // Výpočet rychlosti
        const duration = ((endTime - startTime) / 1000).toFixed(2);
        const text = data.choices[0].message.content;
        
        // Vykreslení odpovědi s odstavci
        responseArea.innerHTML = text.split('\n').filter(p => p.trim() !== "").map(p => `<p>${p}</p>`).join('');
        
        // Přidání technických statistik
        const statsDiv = document.createElement('div');
        statsDiv.className = 'stats';
        statsDiv.innerHTML = `
            <span>Model: <b>${currentModel.split('-')[0].toUpperCase()}</b></span>
            <span>Speed: <b>${duration}s</b></span>
            <span>Engine: <b>Groq LPU</b></span>
        `;
        responseArea.appendChild(statsDiv);
        
    } catch (e) {
        responseArea.innerHTML = "<p style='color:#ef4444'>Nexus se nemohl spojit s mozkem AI. Zkontroluj API klíč.</p>";
    }
};

// Odesílání pomocí Enter (bez Shiftu)
document.getElementById('userInput').addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        document.getElementById('sendBtn').click();
    }
});
