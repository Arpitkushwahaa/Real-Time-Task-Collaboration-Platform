import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DndContext, DragOverlay, closestCorners, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, horizontalListSortingStrategy } from '@dnd-kit/sortable';
import { useBoardStore } from '../store/boardStore';
import socket from '../services/socket';
import { FiArrowLeft, FiPlus, FiSearch } from 'react-icons/fi';
import BoardList from '../components/BoardList';
import TaskCard from '../components/TaskCard';
import CreateListModal from '../components/CreateListModal';
import CreateTaskModal from '../components/CreateTaskModal';
import { Task } from '../types';

const BoardView = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentBoard, fetchBoard, loading, moveTask, addTask, updateTask, removeTask } = useBoardStore();
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [showCreateList, setShowCreateList] = useState(false);
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [selectedListId, setSelectedListId] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  useEffect(() => {
    if (id) {
      fetchBoard(id);
      socket.joinBoard(id);

      // Setup real-time listeners
      socket.onTaskCreated((data) => {
        if (data.task) {
          addTask(data.task);
        }
      });

      socket.onTaskUpdated((data) => {
        if (data.task) {
          updateTask(data.task);
        }
      });

      socket.onTaskDeleted((data) => {
        if (data.taskId) {
          removeTask(data.taskId);
        }
      });

      socket.onTaskMoved((data) => {
        if (data.task) {
          moveTask(data.task._id, data.oldListId, data.task.list, data.task.position);
        }
      });

      return () => {
        socket.leaveBoard(id);
        socket.removeAllListeners();
      };
    }
  }, [id, fetchBoard, addTask, updateTask, removeTask, moveTask]);

  const handleDragStart = (event: any) => {
    const { active } = event;
    const task = currentBoard?.lists
      ?.flatMap((list) => list.tasks || [])
      .find((t) => t._id === active.id);
    setActiveTask(task || null);
  };

  const handleDragEnd = async (event: any) => {
    const { active, over } = event;
    
    if (!over || active.id === over.id) {
      setActiveTask(null);
      return;
    }

    const activeTask = currentBoard?.lists
      ?.flatMap((list) => list.tasks || [])
      .find((t) => t._id === active.id);

    if (!activeTask) {
      setActiveTask(null);
      return;
    }

    const overList = currentBoard?.lists?.find(
      (list) => list._id === over.id || list.tasks?.some((t) => t._id === over.id)
    );

    if (!overList) {
      setActiveTask(null);
      return;
    }

    const overTask = overList.tasks?.find((t) => t._id === over.id);
    const newPosition = overTask ? overTask.position : (overList.tasks?.length || 0);

    try {
      const api = (await import('../services/api')).default;
      await api.moveTask(active.id, overList._id, newPosition);
      
      socket.emitTaskMoved({
        boardId: currentBoard?._id,
        task: { ...activeTask, list: overList._id, position: newPosition },
        oldListId: activeTask.list,
      });

      moveTask(active.id, activeTask.list, overList._id, newPosition);
    } catch (error) {
      console.error('Failed to move task:', error);
    }

    setActiveTask(null);
  };

  const handleCreateTask = (listId: string) => {
    setSelectedListId(listId);
    setShowCreateTask(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading board...</p>
        </div>
      </div>
    );
  }

  if (!currentBoard) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 text-xl">Board not found</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="mt-4 btn btn-primary"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: currentBoard.backgroundColor }}>
      {/* Header */}
      <header className="bg-black bg-opacity-20 backdrop-blur-sm">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition-colors"
              >
                <FiArrowLeft className="text-xl" />
              </button>
              <h1 className="text-2xl font-bold text-white">{currentBoard.title}</h1>
            </div>

            <div className="flex items-center space-x-4">
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search tasks..."
                  className="pl-10 pr-4 py-2 bg-white bg-opacity-90 rounded-lg focus:outline-none focus:ring-2 focus:ring-white w-64"
                />
              </div>

              <div className="flex -space-x-2">
                {currentBoard.members.map((member) => (
                  <div
                    key={member.id}
                    className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-sm font-medium text-gray-700 border-2 border-white shadow-lg"
                    title={member.name}
                  >
                    {member.name.charAt(0).toUpperCase()}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Board Content */}
      <div className="p-4 overflow-x-auto">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="flex space-x-4 pb-4">
            <SortableContext
              items={currentBoard.lists?.map((list) => list._id) || []}
              strategy={horizontalListSortingStrategy}
            >
              {currentBoard.lists?.map((list) => (
                <BoardList
                  key={list._id}
                  list={list}
                  onCreateTask={handleCreateTask}
                  searchQuery={searchQuery}
                />
              ))}
            </SortableContext>

            {/* Add List Button */}
            <div className="flex-shrink-0">
              <button
                onClick={() => setShowCreateList(true)}
                className="w-72 bg-white bg-opacity-80 hover:bg-opacity-100 rounded-lg p-4 flex items-center justify-center space-x-2 text-gray-700 font-medium transition-all"
              >
                <FiPlus />
                <span>Add List</span>
              </button>
            </div>
          </div>

          <DragOverlay>
            {activeTask ? <TaskCard task={activeTask} isDragging /> : null}
          </DragOverlay>
        </DndContext>
      </div>

      {showCreateList && (
        <CreateListModal
          boardId={currentBoard._id}
          onClose={() => setShowCreateList(false)}
        />
      )}

      {showCreateTask && (
        <CreateTaskModal
          listId={selectedListId}
          boardId={currentBoard._id}
          onClose={() => {
            setShowCreateTask(false);
            setSelectedListId('');
          }}
        />
      )}
    </div>
  );
};

export default BoardView;
