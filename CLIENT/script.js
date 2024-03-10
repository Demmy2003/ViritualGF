async function submitQuestion() {
    const userInput = document.getElementById('userInput').value;
    const responseContainer = document.getElementById('responseContainer');
    const submitButton = document.getElementById('submitButton');
    const loadingSpinner = document.getElementById('loadingSpinner');
    const chatHistoryContainer = document.getElementById('chatHistoryContainer');

    // Disable input and submit button, show loading spinner
    document.getElementById('userInput').disabled = true;
    submitButton.disabled = true;
    loadingSpinner.style.display = 'block';

    // Clear previous responses
    responseContainer.innerHTML = '';

    // Send a POST request to the server with the user's input
    try {
        const response = await fetch('http://localhost:3000/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ query: userInput })
        });

        const data = await response.json();

        // Display the response from the server in the response container
        chatHistoryContainer.innerHTML = displayChatHistory(data.chatHistory);
    } catch (error) {
        console.error('Error:', error);
        // Display an error message in the response container
        responseContainer.innerHTML = `<p>Error: ${error.message}</p>`;
    } finally {
        // Enable input and submit button, hide loading spinner
        document.getElementById('userInput').disabled = false;
        submitButton.disabled = false;
        loadingSpinner.style.display = 'none';
    }
}

function displayChatHistory(chatHistory) {
    return chatHistory.map(item => {
        if (item.role === 'user') {
            return `<p>You: ${item.content}</p>`;
        } else if (item.role === 'ai') {
            return `<p>Maya: ${item.content}</p>`;
        }
        return ''; // Handle other roles if needed
    }).join('');
}