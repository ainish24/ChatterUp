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

connectButton.addEventListener('click', function() {
    connectButton.style.opacity='0.4';
    connectButton.style.pointerEvents='none';
    connectButton.style.cursor='not-allowed';
    disconnectButton.style.opacity='1';
    disconnectButton.style.pointerEvents='all';
    disconnectButton.style.cursor='pointer';
    usernameForm.style.display='flex';
});

disconnectButton.addEventListener('click', function() {
    disconnectButton.style.opacity='0.4';
    disconnectButton.style.pointerEvents='none';
    disconnectButton.style.cursor='not-allowed';
    connectButton.style.opacity='1';
    connectButton.style.pointerEvents='all';
    connectButton.style.cursor='pointer';
})

usernameForm.addEventListener('click', function(){
    usernameForm.style.display='none';
})
hiddenForm.addEventListener('click', function (e) {
    e.stopPropagation(); 
});