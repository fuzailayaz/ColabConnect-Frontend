export class WebSocketService {
  private socket: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  connect(roomName: string, token: string) {
    const wsUrl = `${process.env.NEXT_PUBLIC_WS_URL}/ws/chat/${roomName}/?token=${token}`;
    
    this.socket = new WebSocket(wsUrl);

    this.socket.onopen = () => {
      console.log('WebSocket Connected');
      this.reconnectAttempts = 0;
    };

    this.socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log('Received message:', data);
    };

    this.socket.onclose = () => {
      console.log('WebSocket Disconnected');
      this.reconnect(roomName, token);
    };

    this.socket.onerror = (error) => {
      console.error('WebSocket Error:', error);
    };

    return this.socket;
  }

  private reconnect(roomName: string, token: string) {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      setTimeout(() => {
        this.connect(roomName, token);
      }, 1000 * this.reconnectAttempts);
    }
  }

  sendMessage(message: any) {
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(message));
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }
}

export const wsService = new WebSocketService();
