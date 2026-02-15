import express from 'express';
import { createList } from '../controllers/listController';
import { createTask, searchTasks } from '../controllers/taskController';
import { getActivities } from '../controllers/activityController';
import { protect } from '../middleware/auth';

const router = express.Router({ mergeParams: true });

router.route('/:boardId/lists').post(protect, createList);
router.route('/:listId/tasks').post(protect, createTask);
router.route('/:boardId/tasks/search').get(protect, searchTasks);
router.route('/:boardId/activities').get(protect, getActivities);

export default router;
