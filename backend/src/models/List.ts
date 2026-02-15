import mongoose, { Document, Schema } from 'mongoose';

export interface IList extends Document {
  _id: mongoose.Types.ObjectId;
  title: string;
  board: mongoose.Types.ObjectId;
  position: number;
  createdAt: Date;
  updatedAt: Date;
}

const listSchema = new Schema<IList>(
  {
    title: {
      type: String,
      required: [true, 'List title is required'],
      trim: true,
      minlength: 1,
      maxlength: 100,
    },
    board: {
      type: Schema.Types.ObjectId,
      ref: 'Board',
      required: true,
    },
    position: {
      type: Number,
      required: true,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
listSchema.index({ board: 1, position: 1 });

export const List = mongoose.model<IList>('List', listSchema);
