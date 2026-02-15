import { Response } from 'express';
import { Board } from '../models/Board';
import { List } from '../models/List';
import { Task } from '../models/Task';
import { Activity } from '../models/Activity';
import { AuthRequest } from '../middleware/auth';
import mongoose from 'mongoose';

// @desc    Get all boards for user
// @route   GET /api/boards
// @access  Private
export const getBoards = async (req: AuthRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const boards = await Board.find({
      $or: [
        { owner: req.user!.id },
        { members: req.user!.id },
      ],
    })
      .populate('owner', 'name email avatar')
      .populate('members', 'name email avatar')
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Board.countDocuments({
      $or: [
        { owner: req.user!.id },
        { members: req.user!.id },
      ],
    });

    res.status(200).json({
      success: true,
      data: boards,
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

// @desc    Get single board
// @route   GET /api/boards/:id
// @access  Private
export const getBoard = async (req: AuthRequest, res: Response) => {
  try {
    const board = await Board.findById(req.params.id)
      .populate('owner', 'name email avatar')
      .populate('members', 'name email avatar');

    if (!board) {
      return res.status(404).json({
        success: false,
        message: 'Board not found',
      });
    }

    // Check if user has access
    const hasAccess =
      board.owner._id.toString() === req.user!.id ||
      board.members.some((member: any) => member._id.toString() === req.user!.id);

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this board',
      });
    }

    // Get lists with tasks
    const lists = await List.find({ board: board._id }).sort({ position: 1 });

    const listsWithTasks = await Promise.all(
      lists.map(async (list) => {
        const tasks = await Task.find({ list: list._id })
          .populate('assignedTo', 'name email avatar')
          .sort({ position: 1 });

        return {
          ...list.toObject(),
          tasks,
        };
      })
    );

    res.status(200).json({
      success: true,
      data: {
        ...board.toObject(),
        lists: listsWithTasks,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

// @desc    Create board
// @route   POST /api/boards
// @access  Private
export const createBoard = async (req: AuthRequest, res: Response) => {
  try {
    const { title, description, backgroundColor } = req.body;

    const board = await Board.create({
      title,
      description,
      backgroundColor,
      owner: req.user!.id,
      members: [req.user!.id],
    });

    await Activity.create({
      board: board._id,
      user: req.user!.id,
      action: 'created',
      entityType: 'board',
      entityId: board._id,
      details: { title },
    });

    const populatedBoard = await Board.findById(board._id)
      .populate('owner', 'name email avatar')
      .populate('members', 'name email avatar');

    res.status(201).json({
      success: true,
      data: populatedBoard,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

// @desc    Update board
// @route   PUT /api/boards/:id
// @access  Private
export const updateBoard = async (req: AuthRequest, res: Response) => {
  try {
    let board = await Board.findById(req.params.id);

    if (!board) {
      return res.status(404).json({
        success: false,
        message: 'Board not found',
      });
    }

    // Check ownership
    if (board.owner.toString() !== req.user!.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this board',
      });
    }

    board = await Board.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })
      .populate('owner', 'name email avatar')
      .populate('members', 'name email avatar');

    await Activity.create({
      board: board!._id,
      user: req.user!.id,
      action: 'updated',
      entityType: 'board',
      entityId: board!._id,
      details: req.body,
    });

    res.status(200).json({
      success: true,
      data: board,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

// @desc    Delete board
// @route   DELETE /api/boards/:id
// @access  Private
export const deleteBoard = async (req: AuthRequest, res: Response) => {
  try {
    const board = await Board.findById(req.params.id);

    if (!board) {
      return res.status(404).json({
        success: false,
        message: 'Board not found',
      });
    }

    // Check ownership
    if (board.owner.toString() !== req.user!.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this board',
      });
    }

    // Delete all lists and tasks
    const lists = await List.find({ board: board._id });
    const listIds = lists.map((list) => list._id);

    await Task.deleteMany({ list: { $in: listIds } });
    await List.deleteMany({ board: board._id });
    await Activity.deleteMany({ board: board._id });
    await board.deleteOne();

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

// @desc    Add member to board
// @route   POST /api/boards/:id/members
// @access  Private
export const addMember = async (req: AuthRequest, res: Response) => {
  try {
    const { userId } = req.body;
    const board = await Board.findById(req.params.id);

    if (!board) {
      return res.status(404).json({
        success: false,
        message: 'Board not found',
      });
    }

    // Check ownership
    if (board.owner.toString() !== req.user!.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to add members',
      });
    }

    // Check if already a member
    if (board.members.includes(new mongoose.Types.ObjectId(userId))) {
      return res.status(400).json({
        success: false,
        message: 'User is already a member',
      });
    }

    board.members.push(new mongoose.Types.ObjectId(userId));
    await board.save();

    const populatedBoard = await Board.findById(board._id)
      .populate('owner', 'name email avatar')
      .populate('members', 'name email avatar');

    res.status(200).json({
      success: true,
      data: populatedBoard,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};
