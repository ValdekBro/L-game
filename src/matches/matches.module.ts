import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Match, MatchSchema } from 'src/schemas/match.schema';
import { User, UserSchema } from 'src/schemas/user.schema';
import { UsersModule } from 'src/users/users.module';
import { MatchesController } from './matches.controller';
import { MatchesGateway } from './matches.gateway';
import { MatchesService } from './matches.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Match.name, schema: MatchSchema }]),
    UsersModule,
  ],
  controllers: [MatchesController],
  providers: [MatchesService, MatchesGateway],
  exports: [MatchesService]
})
export class MatchesModule {}