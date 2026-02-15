import { useState } from 'react';
import { FiX } from 'react-icons/fi';
import api from '../services/api';
import socket from '../services/socket';
import { useBoardStore } from '../store/boardStore';

interface CreateListModalProps {
  boardId: string;
  onClose: () => void;
}

const CreateListModal = ({ boardId, onClose }: CreateListModalProps) => {
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const { addList } = useBoardStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const response = await api.createList(boardId, title);
      const newList = response.data;
      
      addList(newList);
      socket.emitListCreated({ boardId, list: newList });
      
      onClose();
    } catch (error) {
      console.error('Failed to create list:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 animate-slide-up">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Create List</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <FiX className="text-2xl" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              List Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="input"
              placeholder="e.g., To Do, In Progress, Done"
              required
              autoFocus
            />
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 btn btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating...' : 'Create List'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateListModal;
