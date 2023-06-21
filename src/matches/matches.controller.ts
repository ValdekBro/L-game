import { Body, Controller, Post, HttpCode, HttpStatus, Request, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/auth/auth.guard';
import { EMatchStatus } from 'src/schemas/match.schema';
import { UsersService } from 'src/users/users.service';
import { MatchesService } from './matches.service';

@Controller('match')
export class MatchesController {
    constructor(
        private matchesService: MatchesService,
        private usersService: UsersService,
    ) {}

    @UseGuards(AuthGuard)
    @HttpCode(HttpStatus.OK)
    @Get('')
    async getMatches(@Request() req) {
        const user = await this.usersService.findOne(req.user.email)
        const matches = await this.matchesService.findByUser(user.id)
        const usersMap = {}; matches.forEach(({ player1, player2 }) => { 
            if(player1) usersMap[player1] = null; 
            if(player2) usersMap[player2] = null;
        })
        const users = await this.usersService.findByIds(Object.keys(usersMap))
        users.forEach(user => usersMap[user.id] = user)
        return matches.map(match => ({
            ...match.toJSON(),
            player1: usersMap[match.player1],
            player2: usersMap[match.player2],
        }))
    }
    
    @UseGuards(AuthGuard)
    @HttpCode(HttpStatus.OK)
    @Get('/random')
    async getRandomOngoingMatch(@Request() req) {
        return this.matchesService.findOnePending()
    }

    @UseGuards(AuthGuard)
    @HttpCode(HttpStatus.OK)
    @Post('/join')
    async connectedToMatch(@Request() req, @Body() body: { roomId: string }) {
        console.log(body)
        const user = await this.usersService.findOne(req.user.email)
        return this.matchesService.join(body.roomId, user.id);
    }

    @UseGuards(AuthGuard)
    @HttpCode(HttpStatus.OK)
    @Post('/finish')
    async finishMatch(@Request() req, @Body() body: { roomId: string }) {
        const user = await this.usersService.findOne(req.user.email)
        const match = await this.matchesService.finish(body.roomId, user.id)
        user.rating += match.winnerRatingChange
        await user.save()
        return user;
    }

}