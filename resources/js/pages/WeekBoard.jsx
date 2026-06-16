import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { DragDropContext, Droppable } from '@hello-pangea/dnd';
import TaskCard from '../components/TaskCard';
import WorkspaceActions from '../components/WorkspaceActions';
import TaskModal from '../components/TaskModal';

function TaskComposer({ date, onAdd, onCancel }) {
    const [title, setTitle] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!title.trim()) return;
        setLoading(true);
        try {
            const { data } = await axios.post('/tasks', {
                title,
                description: '',
                scheduled_for: date,
                status: 'todo',
            });
            onAdd(data.task);
            setTitle('');
        } catch (err) {
            alert('Error creating task');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form className="week-card-composer" onSubmit={handleSubmit}>
            <textarea
                className="week-card-composer__input"
                rows="2"
                placeholder="Введите название карточки"
                maxLength="255"
                value={title}
                onChange={e => setTitle(e.target.value)}
                autoFocus
                onKeyDown={e => {
                    if (e.key === 'Escape') onCancel();
                    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit(e); }
                }}
            />
            <div className="week-card-composer__actions">
                <button type="submit" className="week-card-composer__submit" disabled={loading}>
                    {loading ? 'Добавляем...' : 'Добавить'}
                </button>
                <button type="button" className="week-card-composer__cancel" onClick={onCancel}>
                    ×
                </button>
            </div>
        </form>
    );
}

export default function WeekBoard() {
    const { date } = useParams();
    const [weekData, setWeekData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [composingDate, setComposingDate] = useState(null);
    const [selectedTask, setSelectedTask] = useState(null);

    useEffect(() => {
        fetchWeek();
    }, [date]);

    const fetchWeek = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`/api/workspace/week/${date || ''}`);
            setWeekData(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleToggleDone = async (task) => {
        const nextStatus = task.status === 'done' ? 'todo' : 'done';
        // Optimistic UI update
        const newDays = weekData.days.map(d => ({
            ...d,
            tasks: d.tasks.map(t => t.id === task.id ? { ...t, status: nextStatus } : t)
        }));
        setWeekData({ ...weekData, days: newDays });

        try {
            await axios.put(`/tasks/${task.id}`, { 
                title: task.title, 
                description: task.description || '', 
                scheduled_for: task.scheduled_for, 
                status: nextStatus 
            });
        } catch (err) {
            alert('Failed to toggle status');
            fetchWeek(); // Revert on failure
        }
    };

    const handleDragEnd = async (result) => {
        const { source, destination } = result;
        if (!destination) return;
        if (source.droppableId === destination.droppableId && source.index === destination.index) return;

        const sourceDayIndex = weekData.days.findIndex(d => d.date === source.droppableId);
        const destDayIndex = weekData.days.findIndex(d => d.date === destination.droppableId);
        
        const newDays = [...weekData.days];
        const sourceDay = newDays[sourceDayIndex];
        const destDay = newDays[destDayIndex];

        const [movedTask] = sourceDay.tasks.splice(source.index, 1);
        movedTask.scheduled_for = destination.droppableId;
        destDay.tasks.splice(destination.index, 0, movedTask);

        setWeekData({ ...weekData, days: newDays });

        const updates = destDay.tasks.map((t, idx) => ({ id: t.id, position: idx }));

        try {
            if (source.droppableId !== destination.droppableId) {
                await axios.put(`/tasks/${movedTask.id}`, { 
                    title: movedTask.title,
                    status: movedTask.status,
                    scheduled_for: destination.droppableId 
                });
            }
            await axios.patch('/tasks/reorder', { tasks: updates });
        } catch (err) {
            alert('Failed to reorder');
            fetchWeek(); // Revert
        }
    };

    if (loading || !weekData) {
        return <div className="p-4">Загрузка недели...</div>;
    }

    const currentStart = new Date(weekData.startOfWeek);
    
    // Formatting helper
    const formatDate = (dateObj) => dateObj.toISOString().split('T')[0];
    
    const prevWeek = new Date(currentStart);
    prevWeek.setDate(prevWeek.getDate() - 7);
    const prevWeekStr = formatDate(prevWeek);

    const nextWeek = new Date(currentStart);
    nextWeek.setDate(nextWeek.getDate() + 7);
    const nextWeekStr = formatDate(nextWeek);

    return (
        <div className="week-page">
            <div className="week-toolbar">
                <div className="week-toolbar__nav">
                    <Link to={`/workspace/week/${prevWeekStr}`} className="week-toolbar__arrow">←</Link>
                    <div className="week-toolbar__range">
                        {new Date(weekData.startOfWeek).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })} - 
                        {new Date(weekData.endOfWeek).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })}
                    </div>
                    <Link to={`/workspace/week/${nextWeekStr}`} className="week-toolbar__arrow">→</Link>
                    <Link to="/workspace/week" className="week-toolbar__today">Сегодня</Link>
                </div>
                <WorkspaceActions activeMode="week" />
            </div>

            <DragDropContext onDragEnd={handleDragEnd}>
                <div className="week-board">
                    {weekData.days.map((day) => (
                        <Droppable key={day.date} droppableId={day.date}>
                            {(provided) => (
                                <section 
                                    className="week-column" 
                                    data-date={day.date}
                                    ref={provided.innerRef}
                                    {...provided.droppableProps}
                                >
                                    <div className="week-column__header">
                                        <span className="capitalize">{day.day_name}</span> {day.day_number}
                                    </div>
                                    <div className="week-column__content">
                                        {day.tasks.length === 0 && composingDate !== day.date && (
                                            <div className="week-column__empty">На этот день карточек нет.</div>
                                        )}
                                        {day.tasks.map((task, index) => (
                                            <TaskCard 
                                                key={task.id} 
                                                task={task} 
                                                index={index} 
                                                onToggleDone={handleToggleDone} 
                                                onClick={() => setSelectedTask(task)}
                                            />
                                        ))}
                                        {provided.placeholder}
                                        
                                        {composingDate === day.date && (
                                            <TaskComposer 
                                                date={day.date} 
                                                onAdd={(newTask) => {
                                                    const newDays = weekData.days.map(d => d.date === day.date ? { ...d, tasks: [...d.tasks, newTask] } : d);
                                                    setWeekData({ ...weekData, days: newDays });
                                                    setComposingDate(null);
                                                }}
                                                onCancel={() => setComposingDate(null)} 
                                            />
                                        )}
                                    </div>
                                    {composingDate !== day.date && (
                                        <button 
                                            type="button" 
                                            className="week-column__add"
                                            onClick={() => setComposingDate(day.date)}
                                        >
                                            + Добавить карточку
                                        </button>
                                    )}
                                </section>
                            )}
                        </Droppable>
                    ))}
                </div>
            </DragDropContext>
            
            <TaskModal
                task={selectedTask}
                isOpen={!!selectedTask}
                onClose={() => setSelectedTask(null)}
                onUpdate={(updatedTask) => {
                    const newDays = weekData.days.map(d => ({
                        ...d,
                        tasks: d.tasks.map(t => t.id === updatedTask.id ? { ...t, ...updatedTask } : t)
                    }));
                    setWeekData({ ...weekData, days: newDays });
                    setSelectedTask({ ...selectedTask, ...updatedTask });
                }}
                onDelete={(taskId) => {
                    const newDays = weekData.days.map(d => ({
                        ...d,
                        tasks: d.tasks.filter(t => t.id !== taskId)
                    }));
                    setWeekData({ ...weekData, days: newDays });
                    setSelectedTask(null);
                }}
            />
        </div>
    );
}
