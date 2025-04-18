import { messageModel } from "./databaseSchema.js";

export default function (io){
    io.on("connection",async (socket)=>{
        socket.on('setUsername', async ({userName, room, avatarUrl}) => {
            console.log(`User ${userName} connected to room ${room}`);
            const isExist=await messageModel.find({userName, room, connected:false, type:'user'})
            if(isExist.length>0){
                isExist[0].socketId=socket.id;
                isExist[0].connected=true;
                isExist[0].message=`${userName} has joined the room ${room}`
                isExist[0].timeStamp=Date.now()
                await isExist[0].save()
            }else{
                await messageModel.create({
                    socketId: socket.id,
                    userName: userName,
                    avatarUrl: avatarUrl,
                    message: `${userName} has joined the room ${room}`,
                    room: room,
                    type:'user',
                    connected: true
                })
            }
            socket.join(room);

            const onlineUsers=await messageModel.find({connected:true, room:room, type:'user'});
            const messages=await messageModel.find({room:room, type:'message'}).sort({timeStamp:1})
            socket.emit('previousMessages', messages)
            io.to(room).emit('roomAndOnlineInfo',onlineUsers)
            io.to(room).emit('joiningMessage',(userName))
        })


        socket.on('sendMessage', async ({userName, room, message, avatarUrl}) => {
                const user=await messageModel.findOne({socketId:socket.id})
                const messageObject={
                    socketId: socket.id,
                    avatarUrl: user.avatarUrl,
                    userName: userName,
                    message: message,
                    room: room,
                    connected: true,
                    timeStamp: Date.now(),
                    type:'message'
                }
                io.to(room).emit('receiveMessage', messageObject);
                await messageModel.create(messageObject)
        })

        socket.on('typing', ({userName, room}) => {
            io.to(room).emit('typingEvent', userName);
        })








        socket.on('disconnect', async () => {
            const user=await messageModel.findOne({socketId:socket.id})
            if(!user) return;
            const {userName, room}=user;
            const disconnectedUser=await messageModel.findOne({userName, room, type:'user'})
            disconnectedUser.connected=false;
            disconnectedUser.message=`${userName} has left the room ${room}`;
            await disconnectedUser.save()
            const onlineUsers=await messageModel.find({connected:true, room:room, type:'user'});
            io.to(room).emit('roomAndOnlineInfo',onlineUsers)
            io.to(room).emit('disconnectionMessage',userName)
        })
        
    })
}