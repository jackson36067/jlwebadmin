// webSocket.ts
class WebSocketClient {
  private ws: WebSocket | null = null; // WebSocket 对象
  private url: string; // WebSocket 服务器地址
  private reconnectDelay: number; // 重连延迟
  private maxReconnectAttempts: number; // 最大重连次数
  private reconnectAttempts: number = 0; // 当前重连次数
  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  private eventHandlers: { [key: string]: Function[] } = {}; // 自定义事件处理

  constructor(url: string, reconnectDelay = 3000, maxReconnectAttempts = 10) {
    this.url = url;
    this.reconnectDelay = reconnectDelay;
    this.maxReconnectAttempts = maxReconnectAttempts;
  }

  /**
   * 初始化 WebSocket 连接
   */
  public connect(): void {
    if (this.ws) {
      console.warn("WebSocket is already initialized.");
      return;
    }

    this.ws = new WebSocket(this.url);

    this.ws.onopen = () => {
      console.log("WebSocket connection established.");
      this.reconnectAttempts = 0; // 重置重连计数
      this.emit("open");
    };

    this.ws.onmessage = (event: MessageEvent) => {
      console.log("Received message:", event.data);
      this.emit("message", event.data);
    };

    this.ws.onerror = (error: Event) => {
      console.error("WebSocket error:", error);
      this.emit("error", error);
    };

    this.ws.onclose = (event: CloseEvent) => {
      console.warn("WebSocket connection closed:", event.reason);
      this.emit("close", event);

      if (this.reconnectAttempts < this.maxReconnectAttempts) {
        console.log(`Reconnecting in ${this.reconnectDelay}ms...`);
        setTimeout(() => this.reconnect(), this.reconnectDelay);
        this.reconnectAttempts++;
      } else {
        console.error("Max reconnect attempts reached. Giving up.");
      }
    };
  }

  /**
   * 重连 WebSocket
   */
  private reconnect(): void {
    console.log(`Attempting to reconnect (#${this.reconnectAttempts + 1})...`);
    this.ws = null;
    this.connect();
  }

  /**
   * 发送消息
   * @param message 消息内容
   */
  public send(message): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(
        typeof message === "string" ? message : JSON.stringify(message)
      );
      // console.log("Sent message:", message);
    } else {
      console.error("WebSocket is not connected. Cannot send message.");
    }
  }

  /**
   * 注册事件处理器
   * @param event 事件名 ("open" | "message" | "error" | "close")
   * @param handler 事件处理函数
   */
  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  public on(event: string, handler: Function): void {
    if (!this.eventHandlers[event]) {
      this.eventHandlers[event] = [];
    }
    this.eventHandlers[event].push(handler);
  }

  /**
   * 移除事件处理器
   * @param event 事件名
   * @param handler 事件处理函数
   */
  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  public off(event: string, handler: Function): void {
    if (this.eventHandlers[event]) {
      this.eventHandlers[event] = this.eventHandlers[event].filter(
        (h) => h !== handler
      );
    }
  }

  /**
   * 触发事件
   * @param event 事件名
   * @param args 参数
   */
  private emit(event: string, ...args): void {
    if (this.eventHandlers[event]) {
      this.eventHandlers[event].forEach((handler) => handler(...args));
    }
  }

  /**
   * 关闭 WebSocket 连接
   */
  public close(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
      console.log("WebSocket connection closed by client.");
    }
  }
}

export default WebSocketClient;
