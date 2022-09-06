import classNames from 'classnames/bind';
import styles from './Content.module.scss';
import io from 'socket.io-client';
import { useEffect, useRef, useState } from 'react';

const cx = classNames.bind(styles);

function Content() {
    const socket = useRef();
    const [message, setMessage] = useState('');
    const [name, setName] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        socket.current.emit('on-chat', {name, message });
        setMessage('');
    };

    useEffect(() => {
        socket.current = io("http://localhost:8000/");

        const messengers = document.querySelector('#messengers');

        socket.current.on('user-chat', (message) => {
            const chatItem = document.createElement('li');
            chatItem.textContent = `${message.name}: ${message.message}`;
            messengers.appendChild(chatItem);
        });
    }, []);

    return (
        <div>
            <ul id="messengers"></ul>
            <form onSubmit={handleSubmit}>
                <input type="text" placeholder='name' onChange={(e) => setName(e.target.value)} />
                <input type="text" placeholder='chat' onChange={(e) => setMessage(e.target.value)} />
                <button id="send-chat">Gửi</button>
            </form>
        </div>
    );
}

export default Content;
