import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

export default function TaskModal({ task, isOpen, onClose, onUpdate, onDelete }) {
    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const [isEditingDesc, setIsEditingDesc] = useState(false);
    const [editedTitle, setEditedTitle] = useState(task?.title || '');
    const [editedDesc, setEditedDesc] = useState(task?.description || '');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const titleInputRef = useRef(null);
    const descInputRef = useRef(null);

    useEffect(() => {
        if (isOpen && task) {
            setEditedTitle(task.title);
            setEditedDesc(task.description || '');
            setIsEditingTitle(false);
            setIsEditingDesc(false);
            setError(null);
        }
    }, [task, isOpen]);

    useEffect(() => {
        if (isEditingTitle && titleInputRef.current) {
            titleInputRef.current.focus();
        }
    }, [isEditingTitle]);

    useEffect(() => {
        if (isEditingDesc && descInputRef.current) {
            descInputRef.current.focus();
        }
    }, [isEditingDesc]);

    if (!isOpen || !task) return null;

    const handleSaveTitle = async () => {
        setIsEditingTitle(false);
        if (editedTitle.trim() === task.title) return;
        if (!editedTitle.trim()) {
            setEditedTitle(task.title);
            return;
        }
        await saveTask({ title: editedTitle });
    };

    const handleSaveDesc = async () => {
        setIsEditingDesc(false);
        if (editedDesc.trim() === task.description) return;
        await saveTask({ description: editedDesc });
    };

    const handleToggleStatus = async () => {
        const nextStatus = task.status === 'done' ? 'todo' : 'done';
        await saveTask({ status: nextStatus });
    };

    const saveTask = async (updates) => {
        setLoading(true);
        setError(null);
        try {
            const payload = {
                title: task.title,
                description: task.description || '',
                scheduled_for: task.scheduled_for,
                status: task.status,
                ...updates
            };
            const res = await axios.put(`/tasks/${task.id}`, payload);
            if (onUpdate) onUpdate(res.data.task || payload);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update task');
            if (updates.title) setEditedTitle(task.title);
            if (updates.description !== undefined) setEditedDesc(task.description);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm('Вы уверены, что хотите удалить эту задачу?')) return;
        setLoading(true);
        try {
            await axios.delete(`/tasks/${task.id}`);
            if (onDelete) onDelete(task.id);
            onClose();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to delete task');
            setLoading(false);
        }
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return 'Не указано';
        return new Date(dateStr).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
    };

    return (
        <div className="modal" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }} onClick={onClose}>
            <div className="modal-content modal-task-card" onClick={e => e.stopPropagation()}>
                <div className="modal-task-topbar">
                    <div className="modal-task-date-badge">
                        {formatDate(task.scheduled_for)}
                    </div>
                    <div className="modal-task-actions">
                        <button
                            type="button"
                            className="modal-task-icon-button modal-task-icon-button--danger"
                            onClick={handleDelete}
                            disabled={loading}
                            title="Удалить карточку"
                        >
                            🗑
                        </button>
                        <button
                            type="button"
                            className="modal-close modal-task-icon-button"
                            onClick={onClose}
                            title="Закрыть"
                        >
                            <svg className="modal-task-close-icon" viewBox="0 0 16 16">
                                <path d="M4 4L12 12M12 4L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                            </svg>
                        </button>
                    </div>
                </div>

                <div className="modal-body modal-task-body">
                    {error && <div className="alert alert-error">{error}</div>}

                    <div className="modal-task-title-row">
                        <button
                            type="button"
                            className={`modal-task-status-toggle ${task.status === 'done' ? 'is-done' : ''}`}
                            onClick={handleToggleStatus}
                            disabled={loading}
                        >
                            <span className="modal-task-status-check">{task.status === 'done' ? '✓' : '○'}</span>
                        </button>

                        {isEditingTitle ? (
                            <input
                                ref={titleInputRef}
                                type="text"
                                className="modal-task-title modal-task-editable"
                                value={editedTitle}
                                onChange={e => setEditedTitle(e.target.value)}
                                onBlur={handleSaveTitle}
                                onKeyDown={e => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        handleSaveTitle();
                                    }
                                    if (e.key === 'Escape') {
                                        setEditedTitle(task.title);
                                        setIsEditingTitle(false);
                                    }
                                }}
                                style={{ width: '100%', border: '1px solid #ccc', padding: '4px' }}
                            />
                        ) : (
                            <div
                                className="modal-task-title modal-task-editable"
                                onClick={() => setIsEditingTitle(true)}
                                style={{ cursor: 'text', flex: 1, minHeight: '1.5em' }}
                            >
                                {task.title}
                            </div>
                        )}
                    </div>

                    <div className="modal-task-description-block">
                        <div className="modal-task-description-label">Описание</div>
                        {isEditingDesc ? (
                            <textarea
                                ref={descInputRef}
                                className="modal-task-description modal-task-editable modal-task-editable--description"
                                value={editedDesc}
                                onChange={e => setEditedDesc(e.target.value)}
                                onBlur={handleSaveDesc}
                                onKeyDown={e => {
                                    if (e.key === 'Escape') {
                                        setEditedDesc(task.description);
                                        setIsEditingDesc(false);
                                    }
                                }}
                                rows={5}
                                style={{ width: '100%', border: '1px solid #ccc', padding: '8px', minHeight: '100px' }}
                            />
                        ) : (
                            <div
                                className="modal-task-description modal-task-editable modal-task-editable--description"
                                onClick={() => setIsEditingDesc(true)}
                                style={{ cursor: 'text', minHeight: '60px', whiteSpace: 'pre-wrap' }}
                            >
                                {task.description || <span style={{ color: '#999', fontStyle: 'italic' }}>Добавьте описание...</span>}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
