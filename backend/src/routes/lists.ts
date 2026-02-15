import express from 'express';
import {
  createList,
  updateList,
  deleteList,
  moveList,
} from '../controllers/listController';
import { protect } from '../middleware/auth';

const router = express.Router();

router.route('/:id').put(protect, updateList).delete(protect, deleteList);

router.route('/:id/move').put(protect, moveList);

export default router;
