import { Body, Controller, Post, HttpCode, HttpStatus, Request, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/auth/auth.guard';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
    constructor(
        private usersService: UsersService
    ) {}

    @UseGuards(AuthGuard)
    @HttpCode(HttpStatus.OK)
    @Get('me')
    getMe(@Request() req) {
        console.log(req.user)
        return this.usersService.findOne(req.user.email);
    }

    @HttpCode(HttpStatus.OK)
    @Get('top')
    getTop(@Request() req) {
        return this.usersService.findTop5();
    }
}