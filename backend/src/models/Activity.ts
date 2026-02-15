import mongoose, { Document, Schema } from 'mongoose';

export interface IActivity extends Document {
  _id: mongoose.Types.ObjectId;
  board: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  action: string;
  entityType: 'board' | 'list' | 'task';
  entityId: mongoose.Types.ObjectId;
  details: any;
  createdAt: Date;
}

const activitySchema = new Schema<IActivity>(
  {
    board: {
      type: Schema.Types.ObjectId,
      ref: 'Board',
      required: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    action: {
      type: String,
      required: true,
      enum: [
        'created',
        'updated',
        'deleted',
        'moved',
        'assigned',
        'unassigned',
        'commented',
      ],
    },
    entityType: {
      type: String,
      required: true,
      enum: ['board', 'list', 'task'],
    },
    entityId: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    details: {
      type: Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
activitySchema.index({ board: 1, createdAt: -1 });
activitySchema.index({ user: 1 });

export const Activity = mongoose.model<IActivity>('Activity', activitySchema);
