import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useBoardStore } from '../store/boardStore';
import { FiPlus, FiLogOut, FiGrid } from 'react-icons/fi';
import CreateBoardModal from '../components/CreateBoardModal';

const Dashboard = () => {
  const { user, logout } = useAuthStore();
  const { boards, fetchBoards, loading } = useBoardStore();
  const navigate = useNavigate();
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    fetchBoards();
  }, [fetchBoards]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleBoardClick = (boardId: string) => {
    navigate(`/board/${boardId}`);
  };

  const backgroundColors = [
    '#0079bf', '#d29034', '#519839', '#b04632',
    '#89609e', '#cd5a91', '#4bbf6b', '#00aecc',
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <FiGrid className="text-primary-600 text-2xl" />
              <h1 className="text-2xl font-bold text-gray-900">Task Collaboration</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                <p className="text-xs text-gray-500">{user?.email}</p>
              </div>
              <button
                onClick={handleLogout}
                className="btn btn-secondary flex items-center space-x-2"
              >
                <FiLogOut />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold text-gray-900">Your Boards</h2>
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn btn-primary flex items-center space-x-2"
            >
              <FiPlus />
              <span>Create Board</span>
            </button>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 rounded-lg animate-shimmer" />
              ))}
            </div>
          ) : boards.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-gray-400 mb-4">
                <FiGrid className="text-6xl mx-auto" />
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-2">No boards yet</h3>
              <p className="text-gray-500 mb-6">Create your first board to get started</p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="btn btn-primary"
              >
                Create Your First Board
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {boards.map((board) => (
                <div
                  key={board._id}
                  onClick={() => handleBoardClick(board._id)}
                  className="group cursor-pointer transform transition-all duration-200 hover:scale-105"
                >
                  <div
                    className="h-32 rounded-lg shadow-md p-6 flex flex-col justify-between relative overflow-hidden"
                    style={{ backgroundColor: board.backgroundColor }}
                  >
                    <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity" />
                    <div className="relative">
                      <h3 className="text-xl font-bold text-white mb-2">{board.title}</h3>
                      {board.description && (
                        <p className="text-white text-sm opacity-90 line-clamp-2">
                          {board.description}
                        </p>
                      )}
                    </div>
                    <div className="relative flex items-center space-x-2">
                      <div className="flex -space-x-2">
                        {board.members.slice(0, 3).map((member) => (
                          <div
                            key={member.id}
                            className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-sm font-medium text-gray-700 border-2 border-white"
                            title={member.name}
                          >
                            {member.name.charAt(0).toUpperCase()}
                          </div>
                        ))}
                        {board.members.length > 3 && (
                          <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-xs font-medium text-gray-700 border-2 border-white">
                            +{board.members.length - 3}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {showCreateModal && (
        <CreateBoardModal
          onClose={() => setShowCreateModal(false)}
          colors={backgroundColors}
        />
      )}
    </div>
  );
};

export default Dashboard;
