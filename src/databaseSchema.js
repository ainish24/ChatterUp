import mongoose from "mongoose";

const messageSchema= new mongoose.Schema({
    socketId:{
        type:String,
        required:true
    },
    userName:{
        type:String,
        required:true
    },
    avatarUrl:{
        type:String,
    },
    message:{
        type:String,
        required:true
    },
    room:{
        type:String,
        required:true
    },
    connected:{
        type:Boolean,
        required:true
    },
    type:{
        type:String,
        required:true,
        default:'message'
    },
    timeStamp:{
        type:Date,
        default:Date.now
    }
})

export const messageModel=mongoose.model('Message',messageSchema);