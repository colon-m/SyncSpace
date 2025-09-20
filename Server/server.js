const express = require('express');
const cors = require('cors');
const { createServer } = require("http");
const { Server } = require("socket.io");
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const y = require('yjs');
const { WebsocketProvider } = require('y-websocket');

const app = express();
const httpServer = createServer(app);
const PORT = process.env.PORT || 5000;

// 创建上传目录（如果不存在）
const UPLOAD_DIR = path.join(__dirname, 'uploads');
const TEMP_DIR = path.join(__dirname, 'temp');
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR);
if (!fs.existsSync(TEMP_DIR)) fs.mkdirSync(TEMP_DIR);

// 配置 Multer 处理文件上传
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, TEMP_DIR);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});
const upload = multer({ storage });

app.use(cors());
app.use(express.json());

// ================= 文件上传路由 =================
// 上传分片
app.post("/api/file/upload", upload.single('chunk'), (req, res) => {
  try {
    const { index, name } = req.body;
    const chunk = req.file;
    console.log("Received chunk { index, name, file: chunk }:", { index, name, file: chunk });
    if (!chunk) {
      return res.status(200).send({code: 0, message: 'No file uploaded'});
    }

    // 创建分片专属目录
    const chunkDir = path.join(TEMP_DIR, name);
    if (!fs.existsSync(chunkDir)) {
      fs.mkdirSync(chunkDir, { recursive: true });
    }

    // 移动分片到专属目录
    const targetPath = path.join(chunkDir, index.toString());
    fs.renameSync(chunk.path, targetPath);

    res.status(200).send({code: 0, message: 'Chunk uploaded'});
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).send('Internal server error');
  }
});

// 合并文件
app.post("/api/file/merge", async (req, res) => {
  try {
    const { name } = req.body;
    const chunkDir = path.join(TEMP_DIR, name);
    
    if (!fs.existsSync(chunkDir)) {
      return res.status(200).send({code: 0, message: 'No chunks found' });
    }
    
    const chunks = fs.readdirSync(chunkDir);
    if (chunks.length === 0) {
      return res.status(200).send({code: 0, message: 'No chunks to merge' });
    }

    // 按索引排序
    chunks.sort((a, b) => parseInt(a) - parseInt(b));
    
    // 创建合并文件
    const targetPath = path.join(UPLOAD_DIR, name);
    const writeStream = fs.createWriteStream(targetPath);
    
    // 合并所有分片
    for (const chunk of chunks) {
      const chunkPath = path.join(chunkDir, chunk);
      const buffer = fs.readFileSync(chunkPath);
      writeStream.write(buffer);
      fs.unlinkSync(chunkPath); // 删除分片
    }
    
    writeStream.end();
    fs.rmdirSync(chunkDir); // 删除临时目录
    
    res.status(200).send({ code: 0, message: 'File merged', url: `/uploads/${name}` });
  } catch (err) {
    console.error('Merge error:', err);
    res.status(500).send('Internal server error');
  }
});

const io = new Server(httpServer, {
    cors: {
        origin: "http://localhost:5173",
        AccessControlAllowOrigin: "http://localhost:5173",
        allowedHeaders: ["Access-Control-Allow-Origin"],
        credentials: true,
    }
})
const whiteboardNamespace = io.of('/whiteboard');
const roomStates = {};

// 房间状态管理
const rooms = {};

io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id}`);
  
  socket.on('joinRoom', (roomName) => {
    socket.join(roomName);
    console.log(`${socket.id} joined room: ${roomName}`);
    
    // 初始化房间状态
    if (!rooms[roomName]) {
      rooms[roomName] = {
        elements: []
      };
    }
    
    // 发送当前房间状态
    socket.emit('roomState', rooms[roomName]);
  });
  
  socket.on('leaveRoom', (roomName) => {
    socket.leave(roomName);
    console.log(`${socket.id} left room: ${roomName}`);
  });
  
  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`);
  });
});

// WebSocket服务器用于Yjs通信
const wss = createServer();
wss.listen(5001, () => {
  console.log('Yjs WebSocket server running on port 5001');
});

// 为Yjs设置WebSocket服务器
const yjsWSS = new (require('ws').Server)({ server: wss });

yjsWSS.on('connection', (conn, req) => {
  console.log('Yjs client connected');
  
  // 处理Yjs通信
  // (实际实现中，这里需要处理Yjs的WebSocket协议)
});

const Events =[];
const kanbanNamespace = io.of('/kanban');
kanbanNamespace.on('connect', (socket) => {
    console.log(`${socket.id} has connected to kanban`);
    socket.on('joinRoom', (title,callback) => {
        socket.join(title);
        if(!callback) return;
        const target =  Events.find(eve => eve.title === title);
        if(target){
            callback({ data: target });
        }
    });
    socket.on('deleteEvent', (title) => {
        socket.broadcast.to(title).emit('deleteEvent', title);
        socket.leave(title);
    })
    socket.on('updateEvent', ({room, event}) => {
        const index = Events.findIndex(eve => eve.title === room);
        if (index !== -1) {
            Events[index] = event;
        }
        socket.broadcast.to(room).emit('updateEvent', event);
    });
});

httpServer.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});