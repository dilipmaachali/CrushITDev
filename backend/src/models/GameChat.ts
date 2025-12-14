import mongoose, { Schema, Document } from 'mongoose';

export interface IGameChat extends Document {
  gameId: string;
  userId: string;
  userName: string;
  message: string;
  createdAt: Date;
}

const GameChatSchema = new Schema<IGameChat>({
  gameId: {
    type: String,
    required: true,
    index: true,
  },
  userId: {
    type: String,
    required: true,
  },
  userName: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
    trim: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true,
  },
});

// Index for efficient queries by game
GameChatSchema.index({ gameId: 1, createdAt: 1 });

export const GameChat = mongoose.model<IGameChat>('GameChat', GameChatSchema);
