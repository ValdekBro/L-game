import { Controller, Get, HttpServer, Inject, Param, Redirect, Render, Req } from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { randomUUID } from 'crypto';
import { v4 as uuidv4 } from 'uuid';

@Controller()
export class AppController {
  @Inject(HttpAdapterHost) 
  httpServerRef: HttpAdapterHost
  
  @Get('stats')
  @Render('stats')
  stats() {
    return {};
  }

  @Get('login')
  @Render('login')
  login() {
    return {};
  }

  @Get('signup')
  @Render('register')
  register() {
    return {};
  }

  @Get()
  @Render('menu')
  menu() {
    return {};
  }

  @Get('play')
  @Redirect('/', 302)
  async play(@Req() req) {
    return {
      url: `${req.protocol + '://' + req.get('host')/*await global['app'].getUrl()*/}/room/${uuidv4()}`
    }
  }


  @Get('room/:roomId')
  @Render('room')
  room(@Param('roomId') roomId: string) {
    return {
      roomId
    };
  }
}
