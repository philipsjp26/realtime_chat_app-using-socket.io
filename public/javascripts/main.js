const chatForm = document.getElementById('chat-form')
const socket = io();
const chatMessage = document.querySelector('.chat-messages');

// get username and room from url
const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix:true
});

socket.emit('joinRoom', { username, room});
// message from serever
socket.on("message", (message) => {
  // console.log('pesan ---', message);
  outputMessage(message);
  // console.log('asdasdsa', message)
  chatMessage.scrollTop = chatMessage.scrollHeight;

});

chatForm.addEventListener('submit', (e) => {
    e.preventDefault();

    // get value message
    const msg = e.target.elements.msg.value;

    // Emit message to server
    socket.emit('chatMessage', msg);

    e.target.elements.msg.value = '';
    e.target.elements.msg.focus();
});

function outputMessage(message){
  console.log(message)
  const div = document.createElement('div');
  div.classList.add('message');
  div.innerHTML = `<p class="meta"> ${message.username} <span>${message.time}</span</p>
  <p class="text">
    ${message.text}
  </p>`;
  document.querySelector('.chat-messages').appendChild(div);
  
}
