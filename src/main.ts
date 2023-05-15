import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { AppModule } from './app.module';
import { Server }  from 'socket.io';


async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  const io = new Server(app.getHttpServer());
  io.on('connection', (socket) => {

    socket.on('join-room', async data => {
      console.log(`${socket.id} joins room ${data.roomId}`)
      await socket.join(data.roomId);
      await io.in(data.roomId).emit('player-joined', { users: [...io.sockets.adapter.rooms.get(data.roomId)] });
    });

    socket.on('change-position', async ({roomId, playerId, position}) => {
      console.log(`${playerId} made move`)
      await io.in(roomId).emit('change-position', { playerId, position });
    });

    socket.on('skip', async ({roomId, playerId}) => {
      console.log(`${playerId} made skip`)
      await io.in(roomId).emit('skip', { playerId });
    });

    socket.on('disconnect', () => {
      
    });

    io.of("/").adapter.on("leave-room", (room, id) => {
      io.in(room).emit('leave', { room, id });
    });
  });
  
  app.useStaticAssets(join(__dirname, '..', 'public'));
  app.setBaseViewsDir(join(__dirname, '..', 'views'));
  app.setViewEngine('ejs');
  await app.listen(3000);
  global['app'] = app
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
