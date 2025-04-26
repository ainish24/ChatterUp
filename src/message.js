import { messageModel } from "./databaseSchema.js";

export default function (io){
    io.on("connection",async (socket)=>{
        socket.on('setUsername', async ({ userName, room, avatarUrl }) => {
            console.log(`User ${userName} connected to room ${room}`);
            
            const updateData = {
                socketId: socket.id,
                timeStamp: Date.now(),
                ...(avatarUrl.length !== 0 && { avatarUrl })
            };
        
            // Checking if the user is already connected
            let isExist = await messageModel.findOneAndUpdate(
                { userName, room, connected: true, type: 'user' },
                updateData,
                { new: true }
            );
            
            // If no user is connected, checking for a disconnected user
            if (!isExist) {
                const messageData = {
                    socketId: socket.id,
                    connected: true,
                    message: `${userName} has joined the room ${room}`,
                    timeStamp: Date.now(),
                    ...(avatarUrl.length !== 0 && { avatarUrl })
                };
        
                let isExistFalse = await messageModel.findOneAndUpdate(
                    { userName, room, connected: false, type: 'user' },
                    messageData,
                    { new: true }
                );
        
                // If no previous user is found, creating a new entry
                if (!isExistFalse) {
                    await messageModel.create({
                        socketId: socket.id,
                        userName: userName,
                        avatarUrl: avatarUrl,
                        message: `${userName} has joined the room ${room}`,
                        room: room,
                        type: 'user',
                        connected: true
                    });
                }
            }
        
            socket.join(room);
        
            const onlineUsers = await messageModel.find({ connected: true, room: room, type: 'user' });
            const messages = await messageModel.find({ room: room, type: 'message' }).sort({ timeStamp: 1 });
        
            socket.emit('previousMessages', messages);
            io.to(room).emit('roomAndOnlineInfo', onlineUsers);
            io.to(room).emit('joiningMessage', userName);
        });
        
        


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

        socket.on('userDisconnected',async({userName, room})=>{
            const user=await messageModel.findOne({socketId:socket.id})
            if(!user) return;
            console.log(`User ${userName} disconnected from room ${room}`);
            const disconnectedUser = await messageModel.findOne({socketId: socket.id, type: 'user'});
            disconnectedUser.connected=false;
            disconnectedUser.message=`${userName} has left the room ${room}`;
            await disconnectedUser.save()
            const onlineUsers=await messageModel.find({connected:true, room:room, type:'user'});
            io.to(room).emit('roomAndOnlineInfo',onlineUsers)
            io.to(room).emit('disconnectionMessage',userName)
        })







        // socket.on('disconnect', async () => {
        //     const user=await messageModel.findOne({socketId:socket.id})
        //     if(!user) return;
        //     const {userName, room}=user;
        //     console.log(`User ${userName} disconnected from room ${room}`);
        //     const disconnectedUser = await messageModel.findOne({socketId: socket.id, type: 'user'});
        //     disconnectedUser.connected=false;
        //     disconnectedUser.message=`${userName} has left the room ${room}`;
        //     await disconnectedUser.save()
        //     const onlineUsers=await messageModel.find({connected:true, room:room, type:'user'});
        //     io.to(room).emit('roomAndOnlineInfo',onlineUsers)
        //     io.to(room).emit('disconnectionMessage',userName)
        // })
        
    })
}