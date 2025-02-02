import { Module } from '@nestjs/common';
import { WebSocketClientService } from 'src/socket-client/socket-client.service';

@Module({
  providers: [WebSocketClientService],
})
export class SocketClientModule {}
