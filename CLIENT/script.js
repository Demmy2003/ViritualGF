
window.onSpotifyWebPlaybackSDKReady = () => {
    const token = 'BQAF0KWHUE99jk8JUI7h7BGip3HYgu4ML6iFKPIEz9drFWF2b4hujWlSVdOClLZZSY0Cm1URJay2C8gSPzo-PIsjXoFQfRpiKpTIr-2RQP3MQuQJGBFOVpeXm7o3gR93csR3SHFH9oGASf-FewfWunkkHAKTfsbNrkPqbHDIY5hWbir80Su1TbyQfl88mwDfwwCa';
    const player = new Spotify.Player({
        name: 'Web Playback SDK Quick Start Player',
        getOAuthToken: cb => { cb(token); },
        volume: 0.5
    });

    // Ready
    player.addListener('ready', ({ device_id }) => {
        console.log('Ready with Device ID', device_id);
    });

    // Not Ready
    player.addListener('not_ready', ({ device_id }) => {
        console.log('Device ID has gone offline', device_id);
    });

    player.addListener('initialization_error', ({ message }) => {
        console.error(message);
    });

    player.addListener('authentication_error', ({ message }) => {
        console.error(message);
    });

    player.addListener('account_error', ({ message }) => {
        console.error(message);
    });

    document.getElementById('togglePlay').onclick = function() {
        player.togglePlay();
    };

    player.connect();
}
function getChatHistory() {
    try {
        const storedHistory = localStorage.getItem('myChatHistory');
        return storedHistory ? JSON.parse(storedHistory) : [];
    } catch (error) {
        console.error('Error parsing chat history:', error);
        return [];
    }
}

// Function to update chat history in localStorage
function updateChatHistory(history) {
    localStorage.setItem('myChatHistory', JSON.stringify(history));
}

// Function to display chat history
function displayChatHistory(chatHistory) {
    if (!chatHistory || !Array.isArray(chatHistory)) {
        return '';
    }

    return chatHistory.map(item => {
        if (item.role === 'user') {
            return `<p>You: ${item.content}</p>`;
        } else if (item.role === 'ai') {
            return `<p>Maya: ${item.content}</p>`;
        }
        return ''; // Handle other roles if needed
    }).join('');
}
function clearChat() {
    // Clear chat history in localStorage
    localStorage.removeItem('myChatHistory');

    // Clear chat history on the client side
    const chatHistoryContainer = document.getElementById('chatHistoryContainer');
    chatHistoryContainer.innerHTML = '';

    // You can also reload the page to reset the chat completely
    // window.location.reload();
}
async function submitQuestion() {
    const userInput = document.getElementById('userInput').value;
    const submitButton = document.getElementById('submitButton');
    const loadingSpinner = document.getElementById('loadingSpinner');
    const chatHistoryContainer = document.getElementById('chatHistoryContainer');
    const chatHistory = getChatHistory();

    // Push the user's message to the chat history

    document.getElementById('userInput').disabled = true;
    submitButton.disabled = true;
    loadingSpinner.style.display = 'block';

    // Clear previous responses
    // Display the updated chat history

    // Send a POST request to the server with the user's input and updated chat history
    try {
        const response = await fetch('http://localhost:3000/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ query: userInput, chatHistory }),
        });

        const data = await response.json();

        // Update the chat history on the client side
        updateChatHistory(data.chatHistory);
        chatHistoryContainer.innerHTML = displayChatHistory(data.chatHistory);
        chatHistoryContainer.scrollTop = chatHistoryContainer.scrollHeight;
        if(userInput === "clear chat") {
            clearChat()
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        // Enable input and submit button, hide loading spinner
        document.getElementById('userInput').disabled = false;
        submitButton.disabled = false;
        loadingSpinner.style.display = 'none';
    }
}
const submitButton = document.getElementById('submitButton');
submitButton.addEventListener('click', submitQuestion);
submitButton.addEventListener('touchstart', submitQuestion);
// Load and display initial chat history
const initialChatHistory = getChatHistory();
document.getElementById('chatHistoryContainer').innerHTML = displayChatHistory(initialChatHistory);