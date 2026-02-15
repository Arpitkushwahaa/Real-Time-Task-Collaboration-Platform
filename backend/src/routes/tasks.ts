import express from 'express';
import {
  createTask,
  updateTask,
  deleteTask,
  moveTask,
  assignTask,
  searchTasks,
} from '../controllers/taskController';
import { protect } from '../middleware/auth';

const router = express.Router();

router
  .route('/:id')
  .put(protect, updateTask)
  .delete(protect, deleteTask);

router.route('/:id/move').put(protect, moveTask);
router.route('/:id/assign').post(protect, assignTask);

export default router;
