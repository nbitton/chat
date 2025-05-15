const socketIo = io();

document.querySelector('#messageContainer').style.display = 'none';

document.querySelector('#loginForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const username = document.querySelector('#nameInput').value.trim();

    if (!username) {
        alert('Please enter your name before joining the chat.');
        return;
    }

    socketIo.emit('login', username);

    document.querySelector('#nameInput').dataset.username = username;

    document.querySelector('#loginForm').style.display = 'none';
    document.querySelector('#messageContainer').style.display = 'flex';
});

const msgInput = document.querySelector('#msgInput');
const messages = document.querySelector('#messages');

document.querySelector('#messageForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const username = document.querySelector('#nameInput').dataset.username;

    if (!username) {
        alert('You must enter a name before sending messages.');
        return;
    }

    if (msgInput.value.trim() === '') return;

    socketIo.emit('msg', msgInput.value);

    msgInput.value = '';
});


socketIo.on('msg', (msg) => {
    const messageDiv = document.createElement('div');

    if (msg.includes('has joined') || msg.includes('has left')) {
        messageDiv.classList.add('system-message');
    } else {
        messageDiv.classList.add('message');

        if (msg.startsWith('(Private)')) {
            messageDiv.style.backgroundColor = '#ffeb3b';
            messageDiv.style.color = 'black';
        } else {
            const username = document.querySelector('#nameInput').dataset.username;
            const isUser = msg.startsWith(`${username} says:`) || msg.startsWith(`(Private) ${username}:`);
            messageDiv.classList.add(isUser ? 'user' : 'other');
        }
    }

    messageDiv.textContent = msg;
    messages.appendChild(messageDiv);

    setTimeout(() => {
        messages.scrollTop = messages.scrollHeight;
    }, 100);
});
