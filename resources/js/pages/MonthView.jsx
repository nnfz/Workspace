import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { DragDropContext, Droppable } from '@hello-pangea/dnd';
import TaskCard from '../components/TaskCard';
import WorkspaceActions from '../components/WorkspaceActions';

export default function MonthView() {
    const { month } = useParams();
    const [monthData, setMonthData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchMonth();
    }, [month]);

    const fetchMonth = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`/api/workspace/month/${month || ''}`);
            setMonthData(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleToggleDone = async (task) => {
        const nextStatus = task.status === 'done' ? 'todo' : 'done';
        
        // Optimistic UI update
        const newDays = monthData.days.map(week => 
            week.map(d => ({
                ...d,
                tasks: d.tasks.map(t => t.id === task.id ? { ...t, status: nextStatus } : t)
            }))
        );
        setMonthData({ ...monthData, days: newDays });

        try {
            await axios.put(`/tasks/${task.id}`, { 
                title: task.title, 
                description: task.description || '', 
                scheduled_for: task.scheduled_for, 
                status: nextStatus 
            });
        } catch (err) {
            alert('Failed to toggle status');
            fetchMonth(); // Revert on failure
        }
    };

    const handleDragEnd = async (result) => {
        const { source, destination } = result;
        if (!destination) return;
        if (source.droppableId === destination.droppableId && source.index === destination.index) return;

        let sourceDay, destDay;
        const newDays = monthData.days.map(week => 
            week.map(d => {
                if (d.date_key === source.droppableId) sourceDay = d;
                if (d.date_key === destination.droppableId) destDay = d;
                return { ...d, tasks: [...d.tasks] };
            })
        );

        if (!sourceDay || !destDay) return;

        const [movedTask] = sourceDay.tasks.splice(source.index, 1);
        movedTask.scheduled_for = destination.droppableId;
        destDay.tasks.splice(destination.index, 0, movedTask);

        setMonthData({ ...monthData, days: newDays });

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
            fetchMonth(); // Revert
        }
    };

    if (loading || !monthData) {
        return <div className="p-4">Загрузка месяца...</div>;
    }

    const { currentMonth, prevMonth, nextMonth, days, weeksCount } = monthData;

    // Formatting "YYYY-MM" to words
    const dateObj = new Date(`${currentMonth}-01`);
    const monthTitle = dateObj.toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' });

    return (
        <div className="month-view" style={{ '--month-weeks': weeksCount }}>
            <div className="month-toolbar">
                <div className="month-toolbar__nav">
                    <Link to={`/workspace/month/${prevMonth}`} className="month-toolbar__arrow">←</Link>
                    <div className="month-toolbar__title" style={{ textTransform: 'capitalize' }}>
                        {monthTitle}
                    </div>
                    <Link to={`/workspace/month/${nextMonth}`} className="month-toolbar__arrow">→</Link>
                    <Link to="/workspace/month" className="month-toolbar__today">Сегодня</Link>
                </div>
            </div>

            <div className="month-weekdays">
                <div>Понедельник</div>
                <div>Вторник</div>
                <div>Среда</div>
                <div>Четверг</div>
                <div>Пятница</div>
                <div>Суббота</div>
                <div>Воскресенье</div>
            </div>

            <DragDropContext onDragEnd={handleDragEnd}>
                <div className="month-grid">
                    {days.map((week, weekIndex) => (
                        week.map((day) => (
                            <Droppable key={day.date_key} droppableId={day.date_key}>
                                {(provided) => (
                                    <section
                                        ref={provided.innerRef}
                                        {...provided.droppableProps}
                                        className={`month-day ${!day.isCurrentMonth ? 'month-day--outside' : ''} ${day.isToday ? 'month-day--today' : ''}`}
                                        data-date={day.date_key}
                                    >
                                        <header className="month-day__header">
                                            <span>{new Date(day.date).getDate()}</span>
                                        </header>

                                        <div className="month-day__content">
                                            {day.tasks.map((task, index) => (
                                                <TaskCard key={task.id} task={task} index={index} onToggleDone={handleToggleDone} />
                                            ))}
                                            {provided.placeholder}
                                        </div>
                                    </section>
                                )}
                            </Droppable>
                        ))
                    ))}
                </div>
            </DragDropContext>
            
            <TaskModal
                task={selectedTask}
                isOpen={!!selectedTask}
                onClose={() => setSelectedTask(null)}
                onUpdate={(updatedTask) => {
                    const newDays = monthData.days.map(week => 
                        week.map(d => ({
                            ...d,
                            tasks: d.tasks.map(t => t.id === updatedTask.id ? { ...t, ...updatedTask } : t)
                        }))
                    );
                    setMonthData({ ...monthData, days: newDays });
                    setSelectedTask({ ...selectedTask, ...updatedTask });
                }}
                onDelete={(taskId) => {
                    const newDays = monthData.days.map(week => 
                        week.map(d => ({
                            ...d,
                            tasks: d.tasks.filter(t => t.id !== taskId)
                        }))
                    );
                    setMonthData({ ...monthData, days: newDays });
                }}
            />
        </div>
    );
}