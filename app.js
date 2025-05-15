import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import path from 'path';

const app = express();
const __dirname = path.resolve();

app.use(express.static(path.join(__dirname, 'public')));

const server = http.createServer(app);
const io = new Server(server);

const chatters = {}; 

io.on('connection', (socket) => {
    let name;
    console.log('A user connected');

    socket.on('login', (n) => {
        name = n;
        chatters[name] = socket; 

        socket.broadcast.emit('msg', `${name} has joined the chat`);
    });

    socket.on('msg', (msg) => {
        if (msg.startsWith('@')) {
            const parts = msg.split(' ');
            const recipient = parts[0].substring(1);
            const privateMsg = parts.slice(1).join(' ');

            if (chatters[recipient]) {
                chatters[recipient].emit('msg', `(Private) ${name}: ${privateMsg}`);
            } else {
                socket.emit('msg', `System: ${recipient} is not online.`);
            }
        } else {
            io.emit('msg', `${name} says: ${msg}`);
        }
    });

    socket.on('disconnect', () => {
        if (name) {
            delete chatters[name];
            io.emit('msg', `${name} has left the chat`);
        }
    });
});

//server.listen(80, () => console.log('Server running on port 80'));

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
