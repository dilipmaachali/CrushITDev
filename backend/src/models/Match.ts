import mongoose from 'mongoose';

export interface IMatch extends mongoose.Document {
  userId: mongoose.Types.ObjectId;
  sport: 'cricket' | 'badminton' | 'football';
  matchData: any; // Flexible schema for different sports
  status: 'setup' | 'in-progress' | 'completed';
  createdAt: Date;
  updatedAt: Date;
}

const MatchSchema = new mongoose.Schema<IMatch>({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true, 
    index: true 
  },
  sport: { 
    type: String, 
    enum: ['cricket', 'badminton', 'football'], 
    required: true 
  },
  matchData: { 
    type: mongoose.Schema.Types.Mixed, 
    required: true 
  },
  status: { 
    type: String, 
    enum: ['setup', 'in-progress', 'completed'], 
    default: 'setup' 
  },
}, { 
  timestamps: true 
});

// Indexes for performance
MatchSchema.index({ userId: 1, sport: 1 });
MatchSchema.index({ status: 1 });
MatchSchema.index({ createdAt: -1 }); // Recent matches first

export const Match = mongoose.model<IMatch>('Match', MatchSchema);
