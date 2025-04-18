//autoConnect: false-------prevents auto reconnect when calling the disconnect method
const socket = io({ autoConnect: false });

let userName, joinTime, leaveTime, room;

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
    rollupButton.style.display='none'
    dropdownButton.style.display='inline-block';
    dropdownMenu.style.opacity='0';
    dropdownMenu.style.transform='translateY(-10px)';
    setTimeout(function(){
        dropdownMenu.style.display='none';
    },300)
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
