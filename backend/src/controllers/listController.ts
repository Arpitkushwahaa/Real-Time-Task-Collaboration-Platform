import { Response } from 'express';
import { List } from '../models/List';
import { Board } from '../models/Board';
import { Task } from '../models/Task';
import { Activity } from '../models/Activity';
import { AuthRequest } from '../middleware/auth';

// @desc    Create list
// @route   POST /api/boards/:boardId/lists
// @access  Private
export const createList = async (req: AuthRequest, res: Response) => {
  try {
    const { title } = req.body;
    const { boardId } = req.params;

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

    // Get position
    const listsCount = await List.countDocuments({ board: boardId });

    const list = await List.create({
      title,
      board: boardId,
      position: listsCount,
    });

    await Activity.create({
      board: boardId,
      user: req.user!.id,
      action: 'created',
      entityType: 'list',
      entityId: list._id,
      details: { title },
    });

    res.status(201).json({
      success: true,
      data: list,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

// @desc    Update list
// @route   PUT /api/lists/:id
// @access  Private
export const updateList = async (req: AuthRequest, res: Response) => {
  try {
    const list = await List.findById(req.params.id);

    if (!list) {
      return res.status(404).json({
        success: false,
        message: 'List not found',
      });
    }

    // Check board access
    const board = await Board.findById(list.board);
    const hasAccess =
      board!.owner.toString() === req.user!.id ||
      board!.members.some((member) => member.toString() === req.user!.id);

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized',
      });
    }

    const updatedList = await List.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    await Activity.create({
      board: list.board,
      user: req.user!.id,
      action: 'updated',
      entityType: 'list',
      entityId: list._id,
      details: req.body,
    });

    res.status(200).json({
      success: true,
      data: updatedList,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

// @desc    Delete list
// @route   DELETE /api/lists/:id
// @access  Private
export const deleteList = async (req: AuthRequest, res: Response) => {
  try {
    const list = await List.findById(req.params.id);

    if (!list) {
      return res.status(404).json({
        success: false,
        message: 'List not found',
      });
    }

    // Check board access
    const board = await Board.findById(list.board);
    const hasAccess =
      board!.owner.toString() === req.user!.id ||
      board!.members.some((member) => member.toString() === req.user!.id);

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized',
      });
    }

    // Delete all tasks in this list
    await Task.deleteMany({ list: list._id });
    await list.deleteOne();

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

// @desc    Move list
// @route   PUT /api/lists/:id/move
// @access  Private
export const moveList = async (req: AuthRequest, res: Response) => {
  try {
    const { position } = req.body;
    const list = await List.findById(req.params.id);

    if (!list) {
      return res.status(404).json({
        success: false,
        message: 'List not found',
      });
    }

    const oldPosition = list.position;
    list.position = position;
    await list.save();

    // Update positions of other lists
    if (position < oldPosition) {
      await List.updateMany(
        {
          board: list.board,
          position: { $gte: position, $lt: oldPosition },
          _id: { $ne: list._id },
        },
        { $inc: { position: 1 } }
      );
    } else {
      await List.updateMany(
        {
          board: list.board,
          position: { $gt: oldPosition, $lte: position },
          _id: { $ne: list._id },
        },
        { $inc: { position: -1 } }
      );
    }

    res.status(200).json({
      success: true,
      data: list,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};
