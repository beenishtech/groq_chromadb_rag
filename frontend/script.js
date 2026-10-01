const chatMessages = document.getElementById('chatMessages');
const userInput = document.getElementById('userInput');
const sendBtn = document.getElementById('sendBtn');

// FastAPI backend ka sahi endpoint URL yahan update kar diya hai
const API_URL = "http://localhost:8000/rag/query"; 

// Event Listeners for sending message
sendBtn.addEventListener('click', sendMessage);
userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        sendMessage();
    }
});

async function sendMessage() {
    const text = userInput.value.trim();
    if (!text) return;

    // 1. Display User Message
    appendMessage(text, 'user-message');
    userInput.value = '';
    scrollToBottom();

    // 2. Show Typing Indicator / Loading message
    const loadingId = appendMessage('Soch raha hoon...', 'bot-message loading');

    try {
        // 3. Send request to FastAPI Backend
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ question: text })
        });

        if (!response.ok) {
            throw new Error('Server error or failed to fetch response.');
        }

        const data = await response.json();
        
        // Remove loading message
        document.getElementById(loadingId).remove();

        // 4. Format and display bot answer + sources
        let botReply = data.answer || "Jawab nahi mil saka.";
        if (data.sources && data.sources.length > 0) {
            botReply += `<br><br><small><strong>Sources:</strong> ${data.sources.join(', ')}</small>`;
        }

        appendMessage(botReply, 'bot-message', true);

    } catch (error) {
        // Remove loading message
        document.getElementById(loadingId).remove();
        appendMessage('Maazrat, server se rabta nahi ho saka. Barah-e-karam apna FastAPI backend check karein.', 'bot-message');
    }

    scrollToBottom();
}

function appendMessage(text, className, isHTML = false) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${className}`;
    
    const uniqueId = 'msg-' + Date.now();
    messageDiv.id = uniqueId;

    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    
    if (isHTML) {
        contentDiv.innerHTML = text;
    } else {
        contentDiv.textContent = text;
    }

    messageDiv.appendChild(contentDiv);
    chatMessages.appendChild(messageDiv);
    scrollToBottom();

    return uniqueId;
}

function scrollToBottom() {
    chatMessages.scrollTop = chatMessages.scrollHeight;
}
