import mongoose, { Document, Schema } from 'mongoose';

export interface IBoard extends Document {
  _id: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  owner: mongoose.Types.ObjectId;
  members: mongoose.Types.ObjectId[];
  backgroundColor: string;
  createdAt: Date;
  updatedAt: Date;
}

const boardSchema = new Schema<IBoard>(
  {
    title: {
      type: String,
      required: [true, 'Board title is required'],
      trim: true,
      minlength: 1,
      maxlength: 100,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    members: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    backgroundColor: {
      type: String,
      default: '#0079bf',
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
boardSchema.index({ owner: 1 });
boardSchema.index({ members: 1 });
boardSchema.index({ createdAt: -1 });

export const Board = mongoose.model<IBoard>('Board', boardSchema);
