import React, { useState, useEffect } from 'react';
import Pagination from '../../../components/ui/Pagination';
import { usePagination } from '../../../hooks/usePagination';
import { Plus, Search, FileText, Download, Trash2, Calendar, FolderOpen, Link, ExternalLink } from 'lucide-react';
import { resourcesService } from './resourcesService';
import type { Resource } from './resourcesService';
import CreateResourceModal from './CreateResourceModal';
import { motion } from 'framer-motion';

const ResourcesPage: React.FC = () => {
    const [resources, setResources] = useState<Resource[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    const fetchResources = async () => {
        try {
            const data = await resourcesService.getAll();
            setResources(data);
        } catch (err) {
            console.error('Failed to load resources', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchResources(); }, []);

    const filteredResources = resources.filter(item =>
        item.title.toLowerCase().includes(searchTerm.toLowerCase())
    ).sort((a, b) => { const ta = new Date(a.created_at).getTime(); const tb = new Date(b.created_at).getTime(); return sortOrder === 'newest' ? tb - ta : ta - tb; });

    const pg = usePagination(filteredResources);

    const handleDelete = async (id: number) => {
        if (window.confirm('Are you sure you want to remove this resource?')) {
            try {
                await resourcesService.delete(id);
                setResources(prev => prev.filter(r => r.id !== id));
            } catch (err) {
                console.error(err);
            }
        }
    };

    return (
        <div className="w-full max-w-7xl mx-auto space-y-8 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6">
                <div>
                    <div className="flex items-center gap-2 text-indigo-600 font-black text-xs uppercase tracking-widest bg-indigo-50 w-fit px-4 py-1.5 rounded-full border border-indigo-100/50 mb-4">
                        <FolderOpen size={16} /> Resources
                    </div>
                    <h1 className="text-3xl font-extrabold text-slate-800 tracking-tighter">Resources</h1>
                    <p className="text-sm text-slate-400 mt-2 font-medium">Upload and share documents and links with your agents.</p>
                </div>
                <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="px-8 h-12 px-6 bg-brand-600 hover:bg-brand-700 text-white rounded-2xl font-extrabold text-sm tracking-tight transition-all hover:scale-105 shadow-xl shadow-brand-200 flex items-center gap-2 flex-shrink-0"
                >
                    <Plus size={16} /> Upload Resource
                </button>
            </div>

            {/* Search */}
            <div className="bg-white rounded-2xl px-6 py-4 border border-surface-100 matte-shadow flex items-center gap-4">
                <Search size={18} className="text-slate-300" />
                <input
                    type="text"
                    placeholder="Search file names or descriptions..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="flex-1 bg-transparent border-none outline-none text-sm font-bold text-slate-700 placeholder:text-slate-300"
                />
                <select value={sortOrder} onChange={e => setSortOrder(e.target.value as 'newest' | 'oldest')} title="Filter by date" aria-label="Filter by date" className="rounded-lg border border-surface-100 bg-surface-50 px-3 py-1.5 text-xs font-bold text-slate-600 outline-none cursor-pointer">
                    <option value="newest">Newest first</option>
                    <option value="oldest">Oldest first</option>
                </select>
                <span className="text-xs font-black text-slate-300 uppercase tracking-widest">{filteredResources.length} records</span>
            </div>

            {/* Table / Cards View */}
            {loading ? (
                <div className="py-24 text-center text-slate-300 font-bold italic animate-pulse">Loading resources...</div>
            ) : filteredResources.length === 0 ? (
                <div className="py-24 text-center bg-white rounded-3xl border-2 border-dashed border-surface-100">
                    <div className="text-6xl mb-6 grayscale opacity-40">📂</div>
                    <h3 className="text-xl font-black text-slate-800 mb-2">No resources yet</h3>
                    <p className="text-sm font-medium text-slate-400">Upload your first document or link to get started.</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {/* Desktop View */}
                    <div className="hidden lg:block overflow-hidden bg-white rounded-3xl border border-surface-100 matte-shadow">
                        <table className="w-full border-collapse text-left">
                            <thead>
                                <tr className="bg-surface-50/70 border-b border-surface-100">
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.12em] text-slate-400">Resource</th>
                                    <th className="px-5 py-4 text-[10px] font-black uppercase tracking-[0.12em] text-slate-400">Type</th>
                                    <th className="px-5 py-4 text-[10px] font-black uppercase tracking-[0.12em] text-slate-400">Link / File</th>
                                    <th className="px-5 py-4 text-[10px] font-black uppercase tracking-[0.12em] text-slate-400">Added</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.12em] text-slate-400 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-surface-100/70">
                                {pg.pageItems.map((item, i) => (
                                    <motion.tr
                                        key={item.id}
                                        initial={{ opacity: 0, y: 8 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: i * 0.03 }}
                                        className="hover:bg-surface-50/80 transition-colors group"
                                    >
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-500 border border-indigo-100/50 flex-shrink-0">
                                                    {item.file ? <FileText size={18} /> : <Link size={18} />}
                                                </div>
                                                <div className="font-black text-sm text-slate-800">{item.title}</div>
                                            </div>
                                        </td>
                                        <td className="px-5 py-4">
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${item.file ? 'bg-indigo-50 text-indigo-600 border-indigo-100/50' : 'bg-sky-50 text-sky-600 border-sky-100/50'}`}>
                                                {item.file ? 'File' : 'Link'}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4">
                                            {item.file ? (
                                                <a href={item.file} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-xs font-bold text-indigo-600 hover:underline">
                                                    <Download size={13} /> Download File
                                                </a>
                                            ) : item.link ? (
                                                <a href={item.link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-xs font-bold text-sky-600 hover:underline truncate max-w-[200px]">
                                                    <ExternalLink size={13} /> {item.link}
                                                </a>
                                            ) : (
                                                <span className="text-xs font-bold text-slate-300 italic">No attachment</span>
                                            )}
                                        </td>
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                                                <Calendar size={12} className="opacity-60" />
                                                {new Date(item.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                {item.file && (
                                                    <a href={item.file} target="_blank" rel="noopener noreferrer" className="p-2.5 rounded-xl bg-white text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all border border-surface-100 matte-shadow">
                                                        <Download size={15} />
                                                    </a>
                                                )}
                                                <button
                                                    onClick={() => handleDelete(item.id)}
                                                    className="p-2.5 rounded-xl bg-white text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all border border-surface-100 matte-shadow"
                                                >
                                                    <Trash2 size={15} />
                                                </button>
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile Card View */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:hidden gap-6">
                        {pg.pageItems.map((item, i) => (
                            <motion.div
                                key={item.id}
                                initial={{ opacity: 0, scale: 0.95 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.05 }}
                                className="bg-white rounded-3xl border border-surface-100 matte-shadow p-6 flex flex-col"
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 border border-indigo-100">
                                        {item.file ? <FileText size={22} /> : <Link size={22} />}
                                    </div>
                                    <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border ${item.file ? 'bg-indigo-50 text-indigo-600 border-indigo-100/50' : 'bg-sky-50 text-sky-600 border-sky-100/50'}`}>
                                        {item.file ? 'Document' : 'Web Link'}
                                    </span>
                                </div>
                                <h3 className="text-lg font-black text-slate-800 mb-2">{item.title}</h3>
                                <div className="flex items-center gap-2 mb-6 text-xs font-bold text-slate-400">
                                    <Calendar size={13} />
                                    {new Date(item.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}
                                </div>
                                <div className="flex gap-2">
                                    {item.file ? (
                                        <a href={item.file} target="_blank" rel="noopener noreferrer" className="flex-1 flex items-center justify-center gap-2 py-3 bg-indigo-600 text-white rounded-xl font-black text-xs shadow-lg shadow-indigo-100">
                                            <Download size={14} /> Download
                                        </a>
                                    ) : (
                                        <a href={item.link ?? '#'} target="_blank" rel="noopener noreferrer" className="flex-1 flex items-center justify-center gap-2 py-3 bg-sky-600 text-white rounded-xl font-black text-xs shadow-lg shadow-sky-100">
                                            <ExternalLink size={14} /> Visit Link
                                        </a>
                                    )}
                                    <button onClick={() => handleDelete(item.id)} className="px-4 bg-rose-50 text-rose-500 rounded-xl hover:bg-rose-100 border border-rose-100 transition-colors">
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                    <Pagination page={pg.page} pageSize={pg.pageSize} total={pg.total} totalPages={pg.totalPages} startIndex={pg.startIndex} endIndex={pg.endIndex} onPageChange={pg.setPage} onPageSizeChange={pg.setPageSize} />
                </div>
            )}

            <CreateResourceModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSuccess={fetchResources}
            />
        </div>
    );
};

export default ResourcesPage;




