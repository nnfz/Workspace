import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import WorkspaceActions from '../components/WorkspaceActions';

export default function Notebook() {
    const [searchParams, setSearchParams] = useSearchParams();
    const sheetId = searchParams.get('sheet');
    
    const [data, setData] = useState({ sheets: [], activeSheet: null, blocks: [] });
    const [loading, setLoading] = useState(true);
    const canvasRef = useRef(null);

    useEffect(() => {
        fetchNotebook();
    }, [sheetId]);

    const fetchNotebook = async () => {
        setLoading(true);
        try {
            const url = '/api/workspace/notebook' + (sheetId ? `?sheet=${sheetId}` : '');
            const res = await axios.get(url);
            setData(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateSheet = async (e) => {
        e.preventDefault();
        try {
            await axios.post('/workspace/notebook/sheets');
            fetchNotebook();
        } catch (err) {
            alert('Error creating sheet');
        }
    };

    const handleDeleteSheet = async (e, id) => {
        e.preventDefault();
        try {
            await axios.delete(`/workspace/notebook/sheets/${id}`);
            if (String(id) === String(data.activeSheet?.id)) {
                setSearchParams({});
            } else {
                fetchNotebook();
            }
        } catch (err) {
            alert('Error deleting sheet');
        }
    };

    const handleCanvasDoubleClick = async (e) => {
        if (e.target !== canvasRef.current) return;
        
        const rect = canvasRef.current.getBoundingClientRect();
        const x = Math.round(e.clientX - rect.left);
        const y = Math.round(e.clientY - rect.top);

        try {
            const res = await axios.post('/notebook/blocks', {
                notebook_sheet_id: data.activeSheet.id,
                content: '',
                x,
                y
            });
            setData({
                ...data,
                blocks: [...data.blocks, res.data.block || { id: res.data.id, x, y, content: '' }]
            });
            fetchNotebook(); // Reload to get the proper ID if needed
        } catch (err) {
            alert('Error creating block');
        }
    };

    const handleBlockUpdate = async (id, content, x, y) => {
        try {
            await axios.put(`/notebook/blocks/${id}`, { content, x, y });
        } catch (err) {
            alert('Error updating block');
        }
    };

    const handleBlockDelete = async (id) => {
        try {
            await axios.delete(`/notebook/blocks/${id}`);
            setData({
                ...data,
                blocks: data.blocks.filter(b => b.id !== id)
            });
        } catch (err) {
            alert('Error deleting block');
        }
    };

    if (loading && !data.activeSheet) {
        return <div className="p-4">Загрузка Notebook...</div>;
    }

    return (
        <div className="notebook-page">
            <div className="week-toolbar">
                <div className="week-toolbar__nav notebook-toolbar__nav">
                    <div className="week-toolbar__range">Notebook</div>
                    <div className="notebook-sheets">
                        {data.sheets.map(sheet => (
                            <div key={sheet.id} className={`notebook-sheets__item ${data.activeSheet?.id === sheet.id ? 'is-active' : ''}`}>
                                <button
                                    onClick={() => setSearchParams({ sheet: sheet.id })}
                                    className="notebook-sheets__link"
                                >
                                    {sheet.display_order}
                                </button>
                                {data.activeSheet?.id === sheet.id && data.sheets.length > 1 && (
                                    <form onSubmit={(e) => handleDeleteSheet(e, sheet.id)} className="notebook-sheets__delete-form">
                                        <button type="submit" className="notebook-sheets__delete" title="Удалить лист">×</button>
                                    </form>
                                )}
                            </div>
                        ))}
                        <form onSubmit={handleCreateSheet} className="notebook-sheets__create-form">
                            <button type="submit" className="notebook-sheets__create" title="Создать новый лист">+</button>
                        </form>
                    </div>
                </div>
            </div>

            <section 
                className="notebook-canvas" 
                ref={canvasRef} 
                onDoubleClick={handleCanvasDoubleClick}
            >
                {data.blocks.map(block => (
                    <article
                        key={block.id}
                        className="notebook-block"
                        style={{ left: `${block.x}px`, top: `${block.y}px` }}
                    >
                        <textarea 
                            className="notebook-block__content" 
                            defaultValue={block.content}
                            onBlur={(e) => handleBlockUpdate(block.id, e.target.value, block.x, block.y)}
                            placeholder="Введите текст..."
                        />
                        <button 
                            className="notebook-block__delete" 
                            onClick={() => handleBlockDelete(block.id)}
                            style={{ position: 'absolute', top: '-10px', right: '-10px', background: 'red', color: 'white', borderRadius: '50%', width: '20px', height: '20px', border: 'none', cursor: 'pointer' }}
                        >
                            ×
                        </button>
                    </article>
                ))}
            </section>
        </div>
    );
}