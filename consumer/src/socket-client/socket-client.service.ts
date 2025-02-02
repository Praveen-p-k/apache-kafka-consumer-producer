import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { io, Socket } from 'socket.io-client';
import { config } from 'src/config';

@Injectable()
export class WebSocketClientService implements OnModuleInit, OnModuleDestroy {
  private client: Socket | null = null;

  private readonly logger = new Logger(WebSocketClientService.name);

  onModuleInit() {
    this.initialize();
  }

  onModuleDestroy() {
    if (this.client) {
      this.client.disconnect();
    }
  }

  private initialize() {
    try {
      this.client = io(config.WEBSOCKET_CONNECTION_URL, {
        transportOptions: {
          polling: {
            extraHeaders: {
              Authorization: `Bearer ${config.WEBSOCKET_CONNECTION_TOKEN}`,
            },
          },
        },
      });

      this.registerEventHandlers();
    } catch (error) {
      this.logger.error('WebSocket initialization failed:', error);
    }
  }

  private registerEventHandlers() {
    if (!this.client) return;

    this.client.on('connect', () => {
      this.logger.log('Connected to WebSocket server');
    });

    this.client.on('connect-error', (error) => {
      this.logger.error(`WebSocket connection error: ${error.message}`);
      if (error.message.includes('401')) {
        this.logger.error('Invalid API key or token: Unauthorized access');
      } else {
        this.reconnect();
      }
    });

    this.client.on('message', (payload) => {
      this.logger.log('Message from server:', payload);
    });

    this.client.on('connection-inactive', (data) => {
      this.logger.log('Message from server:', data);
      this.reconnect();
    });
  }

  private reconnect() {
    setTimeout(() => {
      this.logger.log('Attempting to reconnect...');
      this.initialize();
    }, 5000);
  }

  public sendMessage(payload: any) {
    if (!this.client?.connected) {
      this.logger.error('WebSocket is not connected');
      return;
    }
    try {
      this.client.emit('consumer-events', payload);
    } catch (error) {
      this.logger.error('Failed to send payload:', error);
    }
  }

  subscribeToEvent(event: string, callback: (data: any) => void) {
    if (!this.client) {
      this.logger.error('WebSocket client is not initialized');
      return;
    }
    this.client.on(event, callback);
  }
}
