import express from 'express';
import {
  getBoards,
  getBoard,
  createBoard,
  updateBoard,
  deleteBoard,
  addMember,
} from '../controllers/boardController';
import { protect } from '../middleware/auth';

const router = express.Router();

router.route('/').get(protect, getBoards).post(protect, createBoard);

router
  .route('/:id')
  .get(protect, getBoard)
  .put(protect, updateBoard)
  .delete(protect, deleteBoard);

router.route('/:id/members').post(protect, addMember);

export default router;
