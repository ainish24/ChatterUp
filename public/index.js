//autoConnect: false-------prevents auto reconnect when calling the disconnect method
const socket = io({ autoConnect: false });

let userName, joinTime, leaveTime, room, avatarUrl;

const dropdownButton= document.getElementById('dropdown-button');
const rollupButton=document.getElementById('rollup-button');
const dropdownMenu = document.getElementsByClassName('dropdown-menu')[0];
const connectButton = document.getElementsByClassName('connect')[0];
const disconnectButton = document.getElementsByClassName('disconnect')[0];
const usernameForm=document.getElementsByClassName('username-form')[0];
const hiddenForm = document.querySelector('.hidden-form');
const messageInput=document.querySelector('.message-input');
const textBox=document.querySelector('.text-box');
const typingIndicator = document.querySelector('.typing');
const welcomeMessage = document.querySelector('.welcomeMessage');
const roomInfo = document.querySelector('.roomInfo');
const sendButton=document.querySelector('.send-button');
const messageContainer = document.querySelector('.text-box');
const messageList = document.querySelector('.message-list');

const rollUpLogic=()=>{
    rollupButton.style.display='none'
    dropdownButton.style.display='inline-block';
    dropdownMenu.style.opacity='0';
    dropdownMenu.style.transform='translateY(-10px)';
    setTimeout(function(){
        dropdownMenu.style.display='none';
    },300)
}

dropdownButton.addEventListener('click', function() {
    dropdownButton.style.display='none'
    rollupButton.style.display='inline-block';
    dropdownMenu.style.display='flex';
    setTimeout(function(){
        dropdownMenu.style.opacity='1';
        dropdownMenu.style.transform='translateY(0)';
    },10)

})

rollupButton.addEventListener('click', function() {
    rollUpLogic()
})

const showConnectButton=()=>{
    disconnectButton.style.opacity='0.4';
    disconnectButton.style.pointerEvents='none';
    disconnectButton.style.cursor='not-allowed';
    connectButton.style.opacity='1';
    connectButton.style.pointerEvents='all';
    connectButton.style.cursor='pointer';
}
const showDisconnectButton=()=>{
    connectButton.style.opacity='0.4';
    connectButton.style.pointerEvents='none';
    connectButton.style.cursor='not-allowed';
    disconnectButton.style.opacity='1';
    disconnectButton.style.pointerEvents='all';
    disconnectButton.style.cursor='pointer';
}

connectButton.addEventListener('click', function() {
    showDisconnectButton()
    usernameForm.style.display='flex';
});
disconnectButton.addEventListener('click', function() {
    showConnectButton()
})
usernameForm.addEventListener('click', function(){
    usernameForm.style.display='none';
    showConnectButton()
})
hiddenForm.addEventListener('click', function (e) {
    e.stopPropagation(); 
});

//I have used input event listener instead of keyup event listener to detect the typing in a better way in the text box
//I am using a debounce function to solve the issue of overlapping set timeouts. the typingTimeout timer is cleared evertime the user starts typing within the
//given timeframe (here 1000ms). So if the user stops typing for more than 1000ms, the typing indicator will be hidden and the message input box will be resized to its original size.
//Also I have used nested setTimeout to hide the typing indicator after a delay as when display is set to none, it immediately kills the transition effect of opacity
let typingTimeout;
textBox.addEventListener('input', function () {
    socket.emit('typing', { userName, room });
    socket.on('typingEvent', (incomingUserName) => {
        console.log(incomingUserName, userName)
        if (incomingUserName !== userName) {
            typingIndicator.innerText='';
            typingIndicator.innerText = `${incomingUserName} is typing...`;
        }else{
            typingIndicator.innerText='';
            typingIndicator.innerText = `You are typing...`;
        }
    })
    typingIndicator.style.display = 'block';
    typingIndicator.style.opacity = '1';
    messageInput.style.height = '4em';
    clearTimeout(typingTimeout);
    typingTimeout = setTimeout(function () {
        typingIndicator.style.opacity = '0';
        setTimeout(() => {
            typingIndicator.style.display = 'none';
        }, 500);
        messageInput.style.height = '2.5em';
    }, 1000);
});
socket.on('typingEvent', (incomingUserName) => {
    if (incomingUserName !== userName) {
        typingIndicator.innerText='';
        typingIndicator.innerText = `${incomingUserName} is typing...`;
    }else{
        typingIndicator.innerText='';
        typingIndicator.innerText = `You are typing...`;
    }
    typingIndicator.style.display = 'block';
    typingIndicator.style.opacity = '1';
    messageInput.style.height = '4em';
    clearTimeout(typingTimeout);
    typingTimeout = setTimeout(function () {
        typingIndicator.style.opacity = '0';
        setTimeout(() => {
            typingIndicator.style.display = 'none';
        }, 500);
        messageInput.style.height = '2.5em';
    }, 1000);
})


hiddenForm.addEventListener('submit', function (e) {
    e.preventDefault();
    userName=document.getElementById('username').value;
    room=document.getElementById('room').value;
    avatarUrl=document.getElementById('avatarUrl').value;
    socket.connect()
    socket.emit('setUsername', {userName, room, avatarUrl});
    welcomeMessage.innerText=`Welcome ${userName}`;
    welcomeMessage.style.display='block';
    usernameForm.style.display='none';
    rollUpLogic()
})

socket.on('roomAndOnlineInfo', (onlineUsers) => {
    const roomNumber= onlineUsers[0].room
    const onlineUsersCount=onlineUsers.length;
    let onlineUsersName =[]
    onlineUsers.forEach((user)=>{
        onlineUsersName.push(user.userName)
    })
    const nameString=onlineUsersName.join(', ')
    const roomInfoString=`Room ${roomNumber}: ${nameString} (${onlineUsersCount}<span style="font-size: 0.8em;">🟢</span>)`
    roomInfo.innerHTML=roomInfoString;
    roomInfo.style.display='block';
});
socket.on('joiningMessage', (incomingUserName) => {
    const li = document.createElement('li');
    li.classList.add('join-message-li');
    if(incomingUserName==userName){
        li.innerText = `You joined`;
    }else{
    li.innerText = `${incomingUserName} joined`;
    }
    messageList.appendChild(li);
})
socket.on('disconnectionMessage',(incomingUserName) => {
    const li = document.createElement('li');
    li.classList.add('join-message-li');
    if(incomingUserName==userName){
        li.innerText = `You left`;
    }else{
    li.innerText = `${incomingUserName} left`;
    }
    messageList.appendChild(li);
    })



//To ensure that the user disconnects even if he reloads the page or closes the tab.
window.addEventListener('beforeunload', (event) => {
        socket.disconnect();
});
    
disconnectButton.addEventListener('click', async function() {
    // socket.emit('disconnectUser', {userName, room})
    socket.disconnect()
    roomInfo.innerHTML='';
    welcomeMessage.innerHTML=`${userName} disconnected`;
    rollUpLogic()
    }
)

sendButton.addEventListener('click',function(){
    const message=messageContainer.value;
    if(message.trim() === '') return;
    messageContainer.value='';
    socket.emit('sendMessage', {userName, room, message, avatarUrl});
})


const renderMessage=(messageObject)=>{
    const li=document.createElement('li');
const imageDiv=document.createElement('div');
const image=document.createElement('img');
const textContainerDiv=document.createElement('div');
const messageTimeDiv=document.createElement('div');
const messageTextDiv=document.createElement('div');
const senderName=document.createElement('div');
    senderName.classList.add('receiver-name')
    senderName.innerText=messageObject.userName;
    if(messageObject.userName===userName){
        li.classList.add('text-message-li', 'receiver-side')
        imageDiv.classList.add('receiver-avatar-img')
        textContainerDiv.classList.add('receiver-inner-text')
        textContainerDiv.append(messageTextDiv, messageTimeDiv)
    }else{
        li.classList.add('text-message-li', 'sender-side')
        imageDiv.classList.add('sender-avatar-img')
        textContainerDiv.classList.add('sender-inner-text')
        textContainerDiv.append(senderName, messageTextDiv, messageTimeDiv)
    }
    image.src=messageObject.avatarUrl;
    messageTextDiv.classList.add('message-text')
    messageTimeDiv.classList.add('message-time')
    imageDiv.appendChild(image)
    li.append(imageDiv, textContainerDiv)
    messageTextDiv.innerText=messageObject.message;
    messageTimeDiv.innerText=new Date(messageObject.timeStamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    messageList.appendChild(li)
}

socket.on('previousMessages',(messageObject)=>{
    messageObject.forEach((messageObject)=>{
        renderMessage(messageObject)
    })
})

socket.on('receiveMessage',(messageObject)=>{
    renderMessage(messageObject)
})