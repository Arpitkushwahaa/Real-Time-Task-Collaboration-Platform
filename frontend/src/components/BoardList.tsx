import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { FiPlus, FiMoreVertical } from 'react-icons/fi';
import { List } from '../types';
import TaskCard from './TaskCard';

interface BoardListProps {
  list: List;
  onCreateTask: (listId: string) => void;
  searchQuery: string;
}

const BoardList = ({ list, onCreateTask, searchQuery }: BoardListProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: list._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const filteredTasks = list.tasks?.filter((task) =>
    searchQuery
      ? task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.description?.toLowerCase().includes(searchQuery.toLowerCase())
      : true
  );

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex-shrink-0 w-72"
    >
      <div className="bg-gray-100 rounded-lg shadow-md">
        {/* List Header */}
        <div
          {...attributes}
          {...listeners}
          className="p-3 flex items-center justify-between cursor-grab active:cursor-grabbing"
        >
          <h3 className="font-semibold text-gray-900 flex items-center space-x-2">
            <span>{list.title}</span>
            <span className="text-xs bg-gray-300 text-gray-700 px-2 py-1 rounded-full">
              {filteredTasks?.length || 0}
            </span>
          </h3>
          <button className="text-gray-500 hover:text-gray-700 p-1 rounded hover:bg-gray-200">
            <FiMoreVertical />
          </button>
        </div>

        {/* Tasks */}
        <div className="p-2 space-y-2 max-h-[calc(100vh-300px)] overflow-y-auto">
          <SortableContext
            items={filteredTasks?.map((task) => task._id) || []}
            strategy={verticalListSortingStrategy}
          >
            {filteredTasks?.map((task) => (
              <TaskCard key={task._id} task={task} />
            ))}
          </SortableContext>

          {filteredTasks?.length === 0 && searchQuery && (
            <p className="text-gray-500 text-sm text-center py-4">No matching tasks</p>
          )}
        </div>

        {/* Add Task Button */}
        <div className="p-2">
          <button
            onClick={() => onCreateTask(list._id)}
            className="w-full bg-white hover:bg-gray-50 border-2 border-dashed border-gray-300 hover:border-gray-400 rounded-lg p-3 flex items-center justify-center space-x-2 text-gray-600 font-medium transition-all"
          >
            <FiPlus />
            <span>Add Task</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default BoardList;
