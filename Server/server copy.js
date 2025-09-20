const express = require('express');
const cors = require('cors');
const { createServer } = require("http");
const { Server } = require("socket.io");
const fs = require('fs');
const path = require('path');
const multer = require('multer');

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

// 房间状态管理器
const RoomManager = {
  getRoomState(room) {
    if (!roomStates[room]) {
      roomStates[room] = {
        elements: [],
      };
    }
    return roomStates[room];
  },
  
  applyOperation(room, operation) {
    const state = this.getRoomState(room);
    
    switch (operation.type) {
      case 'add':
        // 防止重复添加
        if (!state.elements.some(el => el.id === operation.element.id)) {
          state.elements.push(operation.element);
        }
        break;

      case 'move':
      case 'update':
        const updateIndex = state.elements.findIndex(el => el.id === operation.id);
        if (updateIndex !== -1) {
          state.elements[updateIndex] = operation.element;
        }
        break;
        
      case 'clear':
        state.elements = [];
        break;
    }
    
    
    return state;
  },
  
  getStateSnapshot(room) {
    const state = this.getRoomState(room);
    return {
      elements: [...state.elements]
    };
  }
};

whiteboardNamespace.on('connect', (socket) => {
  console.log(`${socket.id} has connected`);
  
  // 当用户创建或加入房间
  socket.on('createRoom', (roomName,setElements) => {
    socket.join(roomName);
    
    // 发送当前房间状态给新用户
    const roomState = RoomManager.getStateSnapshot(roomName);
    setElements(roomState.elements)
  });
  
  socket.on('batchOperations', (batch) => {
    const room = Array.from(socket.rooms).find(r => r !== socket.id);
    if (!room) return;
    
    try {
      batch.operations.forEach(operation => {

        RoomManager.applyOperation(room, operation);
        // socket.broadcast.to(room).emit('operation', operation);
      });
      
      socket.to(room).emit('batchOperations', {
        operations: batch.operations,
        clientId: socket.id
      });
      console.log(`Processed batch of ${batch.operations.length} operations in ${room}`);
    } catch (error) {
      console.error('Error processing batch operations:', error);
    }
  });
  
  // 当用户离开房间
  socket.on('leaveRoom', (room) => {
    socket.leave(room);
    console.log(`${socket.id} left room: ${room}`);
  });
  
  // 当用户断开连接
  socket.on('disconnect', () => {
    console.log(`${socket.id} disconnected`);
  });
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