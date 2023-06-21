import { ConflictException, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';

Injectable()
export class AuthService {
  constructor(
    @Inject(UsersService)
    private usersService: UsersService,
    private jwtService: JwtService
  ) {}

  async signIn(email, pass) {
    const user = await this.usersService.findOne(email);
    if (user?.password !== pass) {
      throw new UnauthorizedException();
    }
    console.log(user)
    const payload = { email: user.email, sub: user.id };
    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }

  async register(dto) {
    const existing = await this.usersService.findOne(dto.email)
    if(existing) throw new ConflictException("User with this email already registered")
    return this.usersService.create({ 
        ...dto,
        rating: 0,
    })
  }

  async verifyToken(token: string) {

  }
}