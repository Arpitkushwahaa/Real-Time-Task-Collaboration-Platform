import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { FiClock, FiUser, FiAlertCircle } from 'react-icons/fi';
import { Task } from '../types';
import { format } from 'date-fns';

interface TaskCardProps {
  task: Task;
  isDragging?: boolean;
}

const TaskCard = ({ task, isDragging = false }: TaskCardProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({ id: task._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const priorityColors = {
    low: 'bg-green-100 text-green-800',
    medium: 'bg-yellow-100 text-yellow-800',
    high: 'bg-red-100 text-red-800',
  };

  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date();

  if (isDragging) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-4 w-72 opacity-90 rotate-3">
        <h4 className="font-medium text-gray-900 mb-2">{task.title}</h4>
        {task.description && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">{task.description}</p>
        )}
      </div>
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`bg-white rounded-lg shadow-sm hover:shadow-md transition-all cursor-grab active:cursor-grabbing p-4 ${
        isSortableDragging ? 'opacity-50' : ''
      }`}
    >
      {/* Priority Badge */}
      {task.priority !== 'medium' && (
        <div className="mb-2">
          <span className={`text-xs px-2 py-1 rounded-full ${priorityColors[task.priority]}`}>
            {task.priority}
          </span>
        </div>
      )}

      {/* Title */}
      <h4 className="font-medium text-gray-900 mb-2">{task.title}</h4>

      {/* Description */}
      {task.description && (
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{task.description}</p>
      )}

      {/* Labels */}
      {task.labels && task.labels.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {task.labels.map((label, idx) => (
            <span
              key={idx}
              className="text-xs bg-primary-100 text-primary-800 px-2 py-1 rounded"
            >
              {label}
            </span>
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between text-sm">
        {/* Due Date */}
        {task.dueDate && (
          <div
            className={`flex items-center space-x-1 ${
              isOverdue ? 'text-red-600' : 'text-gray-500'
            }`}
          >
            {isOverdue ? <FiAlertCircle /> : <FiClock />}
            <span>{format(new Date(task.dueDate), 'MMM d')}</span>
          </div>
        )}

        {/* Assigned Users */}
        {task.assignedTo && task.assignedTo.length > 0 && (
          <div className="flex -space-x-2">
            {task.assignedTo.slice(0, 3).map((user, idx) => (
              <div
                key={user.id}
                className="w-6 h-6 rounded-full bg-primary-500 text-white flex items-center justify-center text-xs font-medium border-2 border-white"
                title={user.name}
              >
                {user.name.charAt(0).toUpperCase()}
              </div>
            ))}
            {task.assignedTo.length > 3 && (
              <div className="w-6 h-6 rounded-full bg-gray-500 text-white flex items-center justify-center text-xs font-medium border-2 border-white">
                +{task.assignedTo.length - 3}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskCard;
