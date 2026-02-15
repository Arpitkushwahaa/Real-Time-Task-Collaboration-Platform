import { Response } from 'express';
import { Activity } from '../models/Activity';
import { Board } from '../models/Board';
import { AuthRequest } from '../middleware/auth';

// @desc    Get board activities
// @route   GET /api/boards/:boardId/activities
// @access  Private
export const getActivities = async (req: AuthRequest, res: Response) => {
  try {
    const { boardId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    // Check board access
    const board = await Board.findById(boardId);
    if (!board) {
      return res.status(404).json({
        success: false,
        message: 'Board not found',
      });
    }

    const hasAccess =
      board.owner.toString() === req.user!.id ||
      board.members.some((member) => member.toString() === req.user!.id);

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized',
      });
    }

    const activities = await Activity.find({ board: boardId })
      .populate('user', 'name email avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Activity.countDocuments({ board: boardId });

    res.status(200).json({
      success: true,
      data: activities,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};
