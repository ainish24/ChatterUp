import express from 'express';
import dotenv, { config } from 'dotenv';
import cors from 'cors';
import { Server } from 'socket.io';
import {createServer} from 'http';
import configSocket from './src/message.js';
import { connectDB } from './src/config/databaseConfig.js';


const app=express();
dotenv.config();
app.use(express.static('public'));
app.use(express.urlencoded({extended:true}));
app.use(express.json());
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: "*",
        methods: "*"
    }
})


httpServer.listen(process.env.PORT, () => {
    connectDB();
    console.log(`Server is running on port ${process.env.PORT}`);
    configSocket(io);
})