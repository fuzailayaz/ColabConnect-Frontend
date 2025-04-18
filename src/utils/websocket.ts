// src/utils/websocket.ts
export class WebSocketService {
  private socket: WebSocket | null = null;
  private reconnectAttempts = 0;
  private readonly maxReconnectAttempts = 5;

  connect(roomName: string, token: string) {
    if (typeof window === 'undefined') return null; // Ensure this runs only in the browser

    const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsHost = process.env.NEXT_PUBLIC_WS_URL || window.location.host;
    const wsUrl = `${wsProtocol}//${wsHost}/ws/chat/${roomName}/?token=${token}`;

    this.socket = new WebSocket(wsUrl);

    this.socket.onopen = () => {
      console.log('✅ WebSocket Connected');
      this.reconnectAttempts = 0; // Reset reconnect attempts on successful connection
    };

    this.socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('📩 Received message:', data);
      } catch (error) {
        console.warn('⚠️ Failed to parse WebSocket message:', event.data);
      }
    };

    this.socket.onclose = (event) => {
      console.log(`❌ WebSocket Disconnected (Code: ${event.code})`);
      this.reconnect(roomName, token);
    };

    this.socket.onerror = (error) => {
      console.error('⚠️ WebSocket Error:', {
        error,
        readyState: this.socket?.readyState,
      });
    };

    return this.socket;
  }

  private reconnect(roomName: string, token: string) {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`🔄 Reconnecting... Attempt ${this.reconnectAttempts}`);
      setTimeout(() => {
        this.connect(roomName, token);
      }, 1000 * this.reconnectAttempts); // Exponential backoff
    } else {
      console.warn('⚠️ Max reconnect attempts reached. Connection failed.');
    }
  }

  sendMessage(message: any) {
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(message));
      console.log('📤 Message sent:', message);
    } else {
      console.warn('⚠️ Cannot send message. WebSocket is not open.');
    }
  }

  disconnect() {
    if (this.socket) {
      console.log('🔌 WebSocket Manually Disconnected');
      this.socket.close();
      this.socket = null;
    }
  }

  getSocket(): WebSocket | null {
    return this.socket;
  }
}

export const wsService = new WebSocketService();