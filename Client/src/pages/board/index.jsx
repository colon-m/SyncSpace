import React, { useLayoutEffect, useRef, useCallback, useState, useEffect } from "react";
// import io from 'socket.io-client';
import rough from "roughjs";
import * as Y from 'yjs';
import { WebrtcProvider } from 'y-webrtc';
// import { yCollab } from 'y-codemirror.next';
import { 
  UsergroupAddOutlined, 
  DownOutlined, 
  TeamOutlined, 
  ClearOutlined, 
  LogoutOutlined,
  SyncOutlined
} from '@ant-design/icons';
import { FloatButton, Modal, message,Tooltip } from 'antd';
// import { useTitle } from "/src/hooks/useTitle";
import "./index.css";
// import { throttle } from 'lodash';


const icon = <DownOutlined key="down" />;
// 创建唯一ID生成器
// const generateId = () => `element-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

const Board = () => {
  const canvasRef =  useRef(null);
  const [socket] = useState(null);
  const [isDrawing,setDrawing] = useState(false);
  const [elements,setElements] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [roomName, setRoomName] = useState("");
  const [rooms, setRooms] = useState([]);
  const [curRoom, setCurRoom] = useState("");
  const [selectedElementIndex, setSelectedElementIndex] = useState(null);
  const [selectedElementId, setSelectedElementId] = useState(null);
  const [messageAPI, contextHolder] = message.useMessage();
  const canvasSizeRef = useRef({ width: 0, height: 0 });
  const generator = useRef(rough.generator());
  const [collabStatus, setCollabStatus] = useState("disconnected");
  // 离屏Canvas和缓冲区
  const offscreenCanvasRef = useRef(null);
  const offscreenCtxRef = useRef(null);
  const animationFrameId = useRef(null);
  const tempCanvasRef = useRef(null);
    // 分层渲染状态
  const [draggingElement, setDraggingElement] = useState(null);

  // CRDT相关状态
  const ydocRef = useRef(null);
  const providerRef = useRef(null);
  const elementsArrayRef = useRef(null);
  // 初始化Yjs文档
  const initYjs = useCallback(() => {
      if (!curRoom) return;
      
      // 清理之前的连接
      if (providerRef.current) {
          providerRef.current.destroy();
      }
      
      // 创建新的Y文档
      ydocRef.current = new Y.Doc();
      elementsArrayRef.current = ydocRef.current.getArray('elements');
      
      // 监听变化
      elementsArrayRef.current.observe(() => {
        const yElements = elementsArrayRef.current.toArray();
        // 为每个元素生成roughElement
        const elementsWithRough = yElements.map(el => ({
          ...el,
          roughElement: generator.current.line(el.x1, el.y1, el.x2, el.y2)
        }
  ));
  
  setElements(elementsWithRough);
      });
      
      // 设置WebRTC提供者
      providerRef.current = new WebrtcProvider(curRoom, ydocRef.current, {
          signaling: ['ws://localhost:5001'] // 使用Socket.io服务器作为信令服务器
      });
      
      providerRef.current.on('status', event => {
          setCollabStatus(event.status);
      });
      
      // 设置初始状态
      setElements([...elementsArrayRef.current.toArray()]);
      
  }, [curRoom]);

  // 初始化离屏Canvas
  const initOffscreenCanvas = useCallback(() => {
      const canvas = canvasRef.current;
      if (!canvas || offscreenCanvasRef.current) return;
      
      offscreenCanvasRef.current = document.createElement('canvas');
      offscreenCanvasRef.current.width = canvas.width;
      offscreenCanvasRef.current.height = canvas.height;
      offscreenCtxRef.current = offscreenCanvasRef.current.getContext('2d');
  }, []);

// 更新Canvas尺寸的函数 
  const updateCanvasSize = useCallback(() => {
      const canvas = canvasRef.current;
      const tempCanvas = tempCanvasRef.current;
      if (!canvas || !tempCanvas) return;
      
      const displayWidth = canvas.offsetWidth;
      const displayHeight = canvas.offsetHeight;

      if (canvasSizeRef.current.width === displayWidth && 
          canvasSizeRef.current.height === displayHeight) {
          return;
      }

      const pixelRatio = window.devicePixelRatio || 1;
      
      // 设置主画布尺寸
      canvas._pixelRatio = pixelRatio;
      canvas.width = Math.floor(displayWidth * pixelRatio);
      canvas.height = Math.floor(displayHeight * pixelRatio);
      
      // 设置临时层画布尺寸
      tempCanvas.width = canvas.width;
      tempCanvas.height = canvas.height;
      tempCanvas.style.width = `${displayWidth}px`;
      tempCanvas.style.height = `${displayHeight}px`;
      
      // 设置离屏画布尺寸
      if (offscreenCanvasRef.current) {
          offscreenCanvasRef.current.width = canvas.width;
          offscreenCanvasRef.current.height = canvas.height;
      }
      
      canvasSizeRef.current = { width: displayWidth, height: displayHeight };
  }, []);

  // 重绘函数 
  const redrawElements = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !offscreenCanvasRef.current || !offscreenCtxRef.current) return;
    
    const ctx = canvas.getContext('2d');
    const pixelRatio = canvas._pixelRatio || 1;
    
    // 1. 在离屏Canvas上绘制
    const offscreenCtx = offscreenCtxRef.current;
    offscreenCtx.setTransform(1, 0, 0, 1, 0, 0);
    offscreenCtx.clearRect(0, 0, canvas.width, canvas.height);
    offscreenCtx.scale(pixelRatio, pixelRatio);
    
    const roughCanvas = rough.canvas(offscreenCanvasRef.current);
    elements.forEach(el => {
        if (el.roughElement) {
            roughCanvas.draw(el.roughElement);
        }
    });
    
    // 2. 将离屏画布内容绘制到主画布
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(offscreenCanvasRef.current, 0, 0);
  }, [elements]);

  const redrawDirtyRegion = useCallback((dirtyRect, element) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!canvas || !ctx || !element) return;
    
    const pixelRatio = canvas._pixelRatio || 1;
    
    // 转换脏矩形到物理像素坐标
    const scaledRect = {
        x: dirtyRect.x * pixelRatio,
        y: dirtyRect.y * pixelRatio,
        width: dirtyRect.width * pixelRatio,
        height: dirtyRect.height * pixelRatio
    };
    
    // 清除脏区域
    ctx.clearRect(scaledRect.x, scaledRect.y, scaledRect.width, scaledRect.height);
    
    // 只重绘该元素
    ctx.save();
    ctx.scale(pixelRatio, pixelRatio);
    const roughCanvas = rough.canvas(canvas);
    const roughElement = generator.current.line(
      element.x1, element.y1, element.x2, element.y2
    );
    // console.log("element.roughElement:",element.roughElement);
    roughCanvas.draw(roughElement);
    ctx.restore();
  }, []);

  const renderLoop = useCallback(() => {
    redrawElements();
    animationFrameId.current = requestAnimationFrame(renderLoop);
  }, [redrawElements]);

  useLayoutEffect(() => {
    updateCanvasSize();
    initOffscreenCanvas();
    redrawElements();
    
    // 启动渲染循环
    animationFrameId.current = requestAnimationFrame(renderLoop);
    
    const handleResize = () => {
        updateCanvasSize();
        initOffscreenCanvas();
        redrawElements();
    };
    
    window.addEventListener('resize', handleResize);
    return () => {
        window.removeEventListener('resize', handleResize);
        cancelAnimationFrame(animationFrameId.current);
    };
  }, [updateCanvasSize, initOffscreenCanvas, redrawElements, renderLoop]);

  useEffect(() => {
    if (curRoom) {
        initYjs();
    }
  }, [curRoom, initYjs]);

  const createElement = useCallback((x1, y1, x2, y2) => {
    const id = `element-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    // const roughElement = generator.current.line(x1, y1, x2, y2);
    return {id, x1, y1, x2, y2};
  }, []);

  // 添加元素到CRDT文档
  const addElementToYjs = useCallback((element) => {
    if (!elementsArrayRef.current) return;
    
      // 只存储几何数据
    const { id, x1, y1, x2, y2 } = element;
    ydocRef.current.transact(() => {
      elementsArrayRef.current.push([{ id, x1, y1, x2, y2 }]);
    });
  }, []);

  // 更新CRDT文档中的元素
  const updateElementInYjs = useCallback((index, element) => {
    if (!elementsArrayRef.current || index < 0) return;
    
    ydocRef.current.transact(() => {
        elementsArrayRef.current.delete(index, 1);
        elementsArrayRef.current.insert(index, [element]);
    });
  }, []);

    const getCanvasMousePosition = useCallback((event) => {
        const canvas = canvasRef.current;
        if (!canvas) return { x: 0, y: 0 };

        const rect = canvas.getBoundingClientRect();
        return {
            x: event.clientX - rect.left,
            y: event.clientY - rect.top
        };
    }, []);

    const isPointNearLine = useCallback((point, element) => {
        const { x, y } = point;
        const { x1, y1, x2, y2 } = element;
        
        // 计算点到线段的距离
        const A = x - x1;
        const B = y - y1;
        const C = x2 - x1;
        const D = y2 - y1;
        
        const dot = A * C + B * D;
        const lenSq = C * C + D * D;
        let param = -1;
        if (lenSq !== 0) param = dot / lenSq;
        
        let xx, yy;
        
        if (param < 0) {
            xx = x1;
            yy = y1;
        } else if (param > 1) {
            xx = x2;
            yy = y2;
        } else {
            xx = x1 + param * C;
            yy = y1 + param * D;
        }
        
        const dx = x - xx;
        const dy = y - yy;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        return distance < 3;
    }, []);
    // 查找点击的元素
    const getElementAtPosition = useCallback((x, y) => {
        // 从后向前检查（最后绘制的在最上面）
        for (let i = elements.length - 1; i >= 0; i--) {
            if (isPointNearLine({ x, y }, elements[i])) {
                return i;
            }
        }
        return -1;
    }, [elements, isPointNearLine]);

  const handleMouseDown = useCallback((e) =>{
    const {x, y} = getCanvasMousePosition(e);
    // 检查是否点击了现有元素
    const elementIndex = getElementAtPosition(x, y);
    if (elementIndex >= 0) {
      const element = elements[elementIndex];
      setSelectedElementIndex(elementIndex);
      setSelectedElementId(element.id);
      setDragStart({ x, y });
      setDrawing(false);
      // 准备拖拽元素的分层渲染
      setDraggingElement(element);
    } else {
      setDrawing(true);
      const el = createElement(x, y, x, y);
      // 本地添加时生成roughElement
      const localElement = {
        ...el,
        roughElement: generator.current.line(el.x1, el.y1, el.x2, el.y2)
      };
      setSelectedElementId(el.id);
      setElements(pre=>[...pre,localElement]);
      addElementToYjs(el);
      // 计算脏矩形用于局部渲染
      const dirtyRect = {
        x: Math.min(x, x),
        y: Math.min(y, y),
        width: Math.abs(x - x),
        height: Math.abs(y - y)
      };
      redrawDirtyRegion(dirtyRect, el);
    }
  },[createElement, getCanvasMousePosition, getElementAtPosition, elements, addElementToYjs, redrawDirtyRegion]);

  const handleMouseMove = useCallback((e) => {
    const { x, y } = getCanvasMousePosition(e);
    
    if (selectedElementIndex !== null && selectedElementId) {
      const dx = x - dragStart.x;
      const dy = y - dragStart.y;

      // 更新拖拽元素的位置（分层渲染）
      if (draggingElement) {
        const updatedElement = {
          ...draggingElement,
          x1: draggingElement.x1 + dx,
          y1: draggingElement.y1 + dy,
          x2: draggingElement.x2 + dx,
          y2: draggingElement.y2 + dy,
          roughElement: generator.current.line(
              draggingElement.x1 + dx,
              draggingElement.y1 + dy,
              draggingElement.x2 + dx,
              draggingElement.y2 + dy
          )
        };
          // 在临时层上绘制拖拽元素
        const tempCanvas = tempCanvasRef.current;
        if (tempCanvas) {
          const ctx = tempCanvas.getContext('2d');
          ctx.clearRect(0, 0, tempCanvas.width, tempCanvas.height);
          
          const pixelRatio = tempCanvas._pixelRatio || 1;
          ctx.scale(pixelRatio, pixelRatio);
          
          const roughCanvas = rough.canvas(tempCanvas);
          roughCanvas.draw(updatedElement.roughElement);
        }
        setDraggingElement(updatedElement);
      // updateElementInYjs(selectedElementIndex, newElement);
        setDragStart({ x, y });
      }
    } else if (isDrawing) {
      const index = elements.length - 1;
      if (index >= 0) {
        const element = elements[index];
        const newEl = createElement(element.x1, element.y1, x, y);
        // 使用局部渲染更新正在绘制的元素
        const dirtyRect = {
          x: Math.min(element.x1, x),
          y: Math.min(element.y1, y),
          width: Math.abs(x - element.x1),
          height: Math.abs(y - element.y1)
        };
        console.log("拖动")
        // 更新元素并局部重绘
        updateElementInYjs(index, newEl);
        redrawDirtyRegion(dirtyRect, newEl);
      }
    }
  },[
        createElement,
      isDrawing,
      getCanvasMousePosition,
      selectedElementIndex,
      selectedElementId,
      dragStart,
      elements,
      updateElementInYjs,
      draggingElement,
      redrawDirtyRegion
  ]);

  const handleMouseUp = useCallback(() => {
    if (draggingElement) {
      const tempCanvas = tempCanvasRef.current;
      if (tempCanvas) {
          const ctx = tempCanvas.getContext('2d');
          ctx.clearRect(0, 0, tempCanvas.width, tempCanvas.height);
      };
        // 更新最终位置
      updateElementInYjs(selectedElementIndex, draggingElement);
      setDraggingElement(null);
    }
      setDrawing(false);
      setSelectedElementIndex(null);
  }, [draggingElement, selectedElementIndex, updateElementInYjs]);

  const handleMouseLeave = useCallback(() => {
      if (isDrawing || selectedElementIndex !== null) {
          handleMouseUp();
      }
  }, [isDrawing, selectedElementIndex, handleMouseUp]);

  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleOk = () => {
    if (curRoom) {
      messageAPI.error("请先退出当前房间！");
      return;
    }
    
    if (roomName) {
      setCurRoom(roomName);
      if (!rooms.includes(roomName)) {
          setRooms(prev => [...prev, roomName]);
      }
      messageAPI.success(`已加入房间: ${roomName}`);
    } else {
      messageAPI.warning("房间名称无效");
    }
    setIsModalOpen(false);
  };

  const handleCancel = () => {
      setIsModalOpen(false);
  };

  const handleLeaveRoom = () => {
    if (curRoom) {
      messageAPI.info(`已离开房间: ${curRoom}`);
      if (providerRef.current) {
          providerRef.current.destroy();
      }
      setCurRoom("");
      setElements([]);
  }
  };

  const handleClearBoard = () => {
    if (elementsArrayRef.current) {
      ydocRef.current.transact(() => {
          elementsArrayRef.current.delete(0, elementsArrayRef.current.length);
      });
    }
  }

  const getCollabStatusText = () => {
    switch(collabStatus) {
      case 'connected': return '已连接（协同中）';
      case 'disconnected': return '未连接';
      case 'connecting': return '连接中...';
      default: return collabStatus;
    }
  }
    
  return (
    <div className="board">
      {contextHolder}
      <div className="float-button-group">
        <FloatButton.Group
          trigger="click"
          icon={icon}
          placement="bottom"
        >
          <FloatButton
            className="float-button"
            icon={<UsergroupAddOutlined />}
            onClick={showModal}
            tooltip="创建/加入房间"
          />
          <FloatButton
            icon={<TeamOutlined />}
            className="float-button"
            tooltip="查看房间成员"
          />
          <FloatButton
            icon={<LogoutOutlined />}
            className="float-button"
            onClick={handleLeaveRoom}
            tooltip="离开房间"
          />
        </FloatButton.Group>
        <Modal
          title="创建或加入房间"
          closable={true}
          open={isModalOpen}
          onOk={handleOk}
          onCancel={handleCancel}
        >
          <div className="room-input-container">
            <input 
              className="room-name-input" 
              type="text" 
              placeholder="输入房间名称" 
              value={roomName} 
              onChange={e => setRoomName(e.target.value.trim())}
            />
            <div className="room-tips">
              {rooms.length > 0 && (
                <div>
                  <p>已有房间:</p>
                  <ul className="room-list">
                    {rooms.map(room => (
                      <li key={room} onClick={() => setRoomName(room)}>
                        {room}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </Modal>
      </div>
      
      <div className="board-header">
        <div className="current-room">
          {curRoom ? (
            <>
              <span className="room-name">房间: {curRoom}</span>
              <span className="user-count">在线: 1</span>
            </>
          ) : (
            <span className="no-room">未加入房间 (请创建或加入房间)</span>
          )}
        </div>
        
        <div className="board-controls">
          <div className="clear-board" onClick={handleClearBoard}>
            <ClearOutlined />
            <span>清空画板</span>
          </div>
                <div className="collab-status">
                        <Tooltip title={getCollabStatusText()}>
                            <SyncOutlined spin={collabStatus === 'connecting'} />
                        </Tooltip>
                </div>
            </div>
        </div>

      
      <div className="canvas-container">
        <canvas
          ref={canvasRef}
          className="canvas"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
        />
        <canvas
          ref={tempCanvasRef}
          className="temp-canvas"
          style={{
              position: 'absolute',
              top: 0,
              left: 0,
              pointerEvents: 'none'
          }}
        />
      </div>
      
      <div className="board-footer">
        <div className="connection-status">
          {socket?.connected ? (
            <span className="connected">已连接服务器</span>
          ) : (
            <span className="disconnected">连接中...</span>
          )}
        </div>
        <div className="tool-tip">
          提示: 点击空白处开始绘制，点击线条可拖动
        </div>
      </div>
    </div>
  );
}

export default Board;