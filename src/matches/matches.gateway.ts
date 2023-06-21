import {
  MessageBody,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  ConnectedSocket
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { EMatchStatus } from 'src/schemas/match.schema';
import { UsersService } from 'src/users/users.service';
import { MatchesService } from './matches.service';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class MatchesGateway implements OnGatewayInit<Server> {

    constructor(
        private matchesService: MatchesService
    ) {}

    @WebSocketServer()
    server: Server;

    getRoomUsers(roomId) {
        const res = this.server.sockets.adapter.rooms.get(roomId)
        if(res) return [...res]
        else return []
    }

    afterInit(server: Server) {
        server.of("/").adapter.on("leave-room", async (room, id) => {
            const match = await this.matchesService.findOne(room)
            if(match) {
                const users = this.getRoomUsers(room)
                console.log(users)
                if(users.length === 0) {
                    match.status = EMatchStatus.FINISHED
                    await match.save()
                }
            }
            server.in(room).emit('leave', { room, id });
        });
    };

    // @SubscribeMessage('leave')
    // async leaveRoom(@MessageBody() data: { room, id }, @ConnectedSocket() socket: Socket) {
    // }

    @SubscribeMessage('join-room')
    async joinRoom(@MessageBody() data, @ConnectedSocket() socket: Socket) {
        console.log(`${socket.id} joins room ${data.roomId}`)
        let users = this.getRoomUsers(data.roomId)
        if(users.length == 0)
            await this.matchesService.create({ player1: null, player2: null, status: EMatchStatus.PENDING, winner: null, winnerRatingChange: null, socketRoomId: data.roomId, isPrivate: false })
        await socket.join(data.roomId);
        users = this.getRoomUsers(data.roomId)
        await this.server.in(data.roomId).emit('player-joined', { users });
    }

    @SubscribeMessage('change-position')
    async changePosition(@MessageBody() { roomId, playerId, position }, @ConnectedSocket() socket: Socket) {
        console.log(`${playerId} made move`)
        await this.server.in(roomId).emit('change-position', { playerId, position });
    }

    @SubscribeMessage('skip')
    async skipMove(@MessageBody() { roomId, playerId }, @ConnectedSocket() socket: Socket) {
        console.log(`${playerId} made skip`)
        await this.server.in(roomId).emit('skip', { playerId });
    }
}