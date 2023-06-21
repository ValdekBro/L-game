import { Model } from 'mongoose';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { EMatchStatus, Match } from 'src/schemas/match.schema';

@Injectable()
export class MatchesService {
  constructor(
    @InjectModel(Match.name) private Match: Model<Match>
  ) {}

  async create(dto: Match): Promise<Match> {
    const createdEntity = new this.Match(dto);
    return createdEntity.save();
  }

  async join(roomId: string, userId: string) {
    const match = await this.Match.findOne({ socketRoomId: roomId }).exec()
    if(!match) throw new NotFoundException('Match not found')

    if(!match.player1) {
      match.player1 = userId;
    } else if(!match.player2) {
      match.player2 = userId;
    } else {
      throw new Error('Match already started')
    }

    if(match.player1 && match.player2) {
      match.status = EMatchStatus.STARTED
    }

    await match.save()
    return match
  }

  async updateStatus(id: string, status: EMatchStatus) {
    return this.Match.findByIdAndUpdate(id, { status });
  }

  async finish(roomId: string, winnerUserId: string) {
    const match = await this.Match.findOne({ socketRoomId: roomId }).exec()
    if(!match) throw new NotFoundException('Match not found')

    match.status = EMatchStatus.FINISHED
    match.winnerRatingChange = 25
    match.winner = winnerUserId

    await match.save()
    return match
  }

  async findAll(): Promise<Match[]> {
    return this.Match.find().exec();
  }

  async findById(id: string) {
    return this.Match.findById(id).exec();
  }

  async findOne(roomId: string) {
    return this.Match.findOne({ socketRoomId: roomId }).exec();
  }

  async findOnePending() {
    return this.Match.findOne({ status: EMatchStatus.PENDING }).exec();
  }

  async findByUser(userId: string) {
    return this.Match.find({ $or: [{ player1: userId }, { player2: userId }] }).exec();
  }
}