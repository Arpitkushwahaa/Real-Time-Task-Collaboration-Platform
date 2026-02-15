import { Response } from 'express';
import { Task } from '../models/Task';
import { List } from '../models/List';
import { Board } from '../models/Board';
import { Activity } from '../models/Activity';
import { AuthRequest } from '../middleware/auth';
import mongoose from 'mongoose';

// @desc    Create task
// @route   POST /api/lists/:listId/tasks
// @access  Private
export const createTask = async (req: AuthRequest, res: Response) => {
  try {
    const { title, description, priority, dueDate, labels } = req.body;
    const { listId } = req.params;

    const list = await List.findById(listId);
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

    // Get position
    const tasksCount = await Task.countDocuments({ list: listId });

    const task = await Task.create({
      title,
      description,
      list: listId,
      board: list.board,
      position: tasksCount,
      priority,
      dueDate,
      labels,
    });

    await Activity.create({
      board: list.board,
      user: req.user!.id,
      action: 'created',
      entityType: 'task',
      entityId: task._id,
      details: { title },
    });

    const populatedTask = await Task.findById(task._id).populate(
      'assignedTo',
      'name email avatar'
    );

    res.status(201).json({
      success: true,
      data: populatedTask,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

// @desc    Update task
// @route   PUT /api/tasks/:id
// @access  Private
export const updateTask = async (req: AuthRequest, res: Response) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      });
    }

    // Check board access
    const board = await Board.findById(task.board);
    const hasAccess =
      board!.owner.toString() === req.user!.id ||
      board!.members.some((member) => member.toString() === req.user!.id);

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized',
      });
    }

    const updatedTask = await Task.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    ).populate('assignedTo', 'name email avatar');

    await Activity.create({
      board: task.board,
      user: req.user!.id,
      action: 'updated',
      entityType: 'task',
      entityId: task._id,
      details: req.body,
    });

    res.status(200).json({
      success: true,
      data: updatedTask,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

// @desc    Delete task
// @route   DELETE /api/tasks/:id
// @access  Private
export const deleteTask = async (req: AuthRequest, res: Response) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      });
    }

    // Check board access
    const board = await Board.findById(task.board);
    const hasAccess =
      board!.owner.toString() === req.user!.id ||
      board!.members.some((member) => member.toString() === req.user!.id);

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized',
      });
    }

    await task.deleteOne();

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

// @desc    Move task
// @route   PUT /api/tasks/:id/move
// @access  Private
export const moveTask = async (req: AuthRequest, res: Response) => {
  try {
    const { listId, position } = req.body;
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      });
    }

    const oldListId = task.list;
    const oldPosition = task.position;

    // Moving within same list
    if (listId === oldListId.toString()) {
      task.position = position;
      await task.save();

      if (position < oldPosition) {
        await Task.updateMany(
          {
            list: listId,
            position: { $gte: position, $lt: oldPosition },
            _id: { $ne: task._id },
          },
          { $inc: { position: 1 } }
        );
      } else {
        await Task.updateMany(
          {
            list: listId,
            position: { $gt: oldPosition, $lte: position },
            _id: { $ne: task._id },
          },
          { $inc: { position: -1 } }
        );
      }
    } else {
      // Moving to different list
      task.list = new mongoose.Types.ObjectId(listId);
      task.position = position;
      await task.save();

      // Update old list
      await Task.updateMany(
        {
          list: oldListId,
          position: { $gt: oldPosition },
        },
        { $inc: { position: -1 } }
      );

      // Update new list
      await Task.updateMany(
        {
          list: listId,
          position: { $gte: position },
          _id: { $ne: task._id },
        },
        { $inc: { position: 1 } }
      );
    }

    await Activity.create({
      board: task.board,
      user: req.user!.id,
      action: 'moved',
      entityType: 'task',
      entityId: task._id,
      details: { listId, position },
    });

    const updatedTask = await Task.findById(task._id).populate(
      'assignedTo',
      'name email avatar'
    );

    res.status(200).json({
      success: true,
      data: updatedTask,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

// @desc    Assign user to task
// @route   POST /api/tasks/:id/assign
// @access  Private
export const assignTask = async (req: AuthRequest, res: Response) => {
  try {
    const { userId } = req.body;
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      });
    }

    // Check if already assigned
    if (task.assignedTo.some((id) => id.toString() === userId)) {
      return res.status(400).json({
        success: false,
        message: 'User already assigned',
      });
    }

    task.assignedTo.push(new mongoose.Types.ObjectId(userId));
    await task.save();

    await Activity.create({
      board: task.board,
      user: req.user!.id,
      action: 'assigned',
      entityType: 'task',
      entityId: task._id,
      details: { userId },
    });

    const updatedTask = await Task.findById(task._id).populate(
      'assignedTo',
      'name email avatar'
    );

    res.status(200).json({
      success: true,
      data: updatedTask,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

// @desc    Search tasks
// @route   GET /api/boards/:boardId/tasks/search
// @access  Private
export const searchTasks = async (req: AuthRequest, res: Response) => {
  try {
    const { boardId } = req.params;
    const { q } = req.query;

    const tasks = await Task.find({
      board: boardId,
      $or: [
        { title: { $regex: q as string, $options: 'i' } },
        { description: { $regex: q as string, $options: 'i' } },
      ],
    })
      .populate('assignedTo', 'name email avatar')
      .limit(20);

    res.status(200).json({
      success: true,
      data: tasks,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};
