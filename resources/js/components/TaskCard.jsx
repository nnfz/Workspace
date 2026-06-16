import React from 'react';
import { Draggable } from '@hello-pangea/dnd';

export default function TaskCard({ task, onToggleDone, onClick, index }) {
    return (
        <Draggable draggableId={String(task.id)} index={index}>
            {(provided) => (
                <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    className={`task-card ${task.status === 'done' ? 'task-card--done' : ''}`}
                    data-id={task.id}
                    onClick={onClick}
                >
                    <div className="task-card__content">
                        <button 
                            type="button" 
                            className="task-card__check" 
                            onClick={(e) => {
                                e.stopPropagation();
                                onToggleDone(task);
                            }}
                        >
                            {task.status === 'done' ? '✓' : '○'}
                        </button>
                        <span className="task-card__title">{task.title}</span>
                    </div>
                </div>
            )}
        </Draggable>
    );
}
