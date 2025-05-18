import { useState, useEffect, useCallback, useRef } from 'react';

// 定义连接状态的类型
interface ConnectionStatus {
    text: string;
    color: string;
}

export enum WebSocketCommand {
    PREV = 'prev',
    NEXT = 'next'
  }

export function useWebSocket() {
    const [ws, setWs] = useState<WebSocket | null>(null);
    const isConnecting = useRef(false);

    // 连接状态
    const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({
        text: 'Disconnected',
        color: '#dc3545'  // 红色
    });

    // 连接函数
    const connect = useCallback(() => {
        if (isConnecting.current) return;
        
        isConnecting.current = true;
        // 根据当前协议确定 WebSocket 协议
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsUrl = `${protocol}//${window.location.hostname}:9999`;
        console.log('🔗 正在连接到:', wsUrl);

        const socket = new WebSocket(wsUrl);

        // 连接成功
        socket.onopen = () => {
            console.log('✅ WebSocket 连接已建立');
            setConnectionStatus({
                text: 'Connected',
                color: '#28a745'  // 绿色
            });
            isConnecting.current = false;
        };

        // 连接关闭
        socket.onclose = () => {
            console.log('❌ WebSocket 连接已关闭');
            setConnectionStatus({
                text: '连接已断开，正在重试...',
                color: '#dc3545'  // 红色
            });
            isConnecting.current = false;
            // 1秒后重试连接
            setTimeout(connect, 1000);
        };

        // 连接错误
        socket.onerror = (error) => {
            console.error('❌ WebSocket 错误:', error);
            setConnectionStatus({
                text: 'Connection Error',
                color: '#dc3545'  // 红色
            });
            isConnecting.current = false;
        };

        setWs(socket);
    }, []);

    // 发送命令函数
    const sendCommand = useCallback((command: WebSocketCommand) => {
        console.log('🔍 发送命令:', command);
        if (ws && ws.readyState === WebSocket.OPEN) {
            ws.send(command);
        } else {
            console.log('❌ WebSocket 未连接');
        }
    }, [ws]);

    // 组件挂载时连接，卸载时断开
    useEffect(() => {
        connect();
        return () => {
            if (ws) {
                ws.close();
            }
        };
    }, [connect]);

    return { connectionStatus, sendCommand };
}