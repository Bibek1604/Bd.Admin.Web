import React, { useState, useEffect } from 'react';
import Pagination from '../../../components/ui/Pagination';
import { usePagination } from '../../../hooks/usePagination';
import { Plus, Search, Newspaper, Eye, Edit2, Trash2, Calendar, Image } from 'lucide-react';
import { newsService } from './newsService';
import type { AgentNews } from './newsService';
import CreateNewsModal from './CreateNewsModal';
import resolveImage from '../../../utils/resolveImage';
import { motion } from 'framer-motion';

const NewsPage: React.FC = () => {
    const [news, setNews] = useState<AgentNews[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    const fetchNews = async () => {
        try {
            const data = await newsService.getAll();
            setNews(data);
        } catch (err) {
            console.error('Failed to load news', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchNews(); }, []);

    const filteredNews = news.filter(item =>
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase())
    ).sort((a, b) => { const ta = new Date(a.created_at).getTime(); const tb = new Date(b.created_at).getTime(); return sortOrder === 'newest' ? tb - ta : ta - tb; });

    const pg = usePagination(filteredNews);

    return (
        <div className="w-full max-w-7xl mx-auto space-y-8 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6">
                <div>
                    <div className="flex items-center gap-2 text-brand-600 font-black text-xs uppercase tracking-widest bg-brand-50 w-fit px-4 py-1.5 rounded-full border border-brand-100/50 mb-4">
                        <Newspaper size={16} /> News
                    </div>
                    <h1 className="text-3xl font-extrabold text-slate-800 tracking-tighter">News &amp; Updates</h1>
                    <p className="text-sm text-slate-400 mt-2 font-medium">Share updates and announcements with your agents.</p>
                </div>
                <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="px-8 h-12 px-6 bg-brand-600 hover:bg-brand-700 text-white rounded-2xl font-extrabold text-sm tracking-tight transition-all hover:scale-105 shadow-xl shadow-brand-200 flex items-center gap-2 flex-shrink-0"
                >
                    <Plus size={16} /> New Announcement
                </button>
            </div>

            {/* Search */}
            <div className="bg-white rounded-2xl px-6 py-4 border border-surface-100 matte-shadow flex items-center gap-4">
                <Search size={18} className="text-slate-300" />
                <input
                    type="text"
                    placeholder="Search announcements..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="flex-1 bg-transparent border-none outline-none text-sm font-bold text-slate-700 placeholder:text-slate-300"
                />
                <select value={sortOrder} onChange={e => setSortOrder(e.target.value as 'newest' | 'oldest')} title="Filter by date" aria-label="Filter by date" className="rounded-lg border border-surface-100 bg-surface-50 px-3 py-1.5 text-xs font-bold text-slate-600 outline-none cursor-pointer">
                    <option value="newest">Newest first</option>
                    <option value="oldest">Oldest first</option>
                </select>
                <span className="text-xs font-black text-slate-300 uppercase tracking-widest">{filteredNews.length} Articles</span>
            </div>

            {/* Table / Cards View */}
            {loading ? (
                <div className="py-24 text-center text-slate-300 font-bold italic animate-pulse">Loading news...</div>
            ) : filteredNews.length === 0 ? (
                <div className="py-24 text-center bg-white rounded-3xl border-2 border-dashed border-surface-100">
                    <div className="text-6xl mb-6 grayscale opacity-40">📭</div>
                    <h3 className="text-xl font-black text-slate-800 mb-2">No Announcements Yet</h3>
                    <p className="text-sm font-medium text-slate-400">Create your first announcement to get started.</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {/* Desktop View */}
                    <div className="hidden lg:block overflow-hidden bg-white rounded-3xl border border-surface-100 matte-shadow">
                        <table className="w-full border-collapse text-left">
                            <thead>
                                <tr className="bg-surface-50/70 border-b border-surface-100">
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.12em] text-slate-400">Article</th>
                                    <th className="px-5 py-4 text-[10px] font-black uppercase tracking-[0.12em] text-slate-400">Preview</th>
                                    <th className="px-5 py-4 text-[10px] font-black uppercase tracking-[0.12em] text-slate-400">Cover</th>
                                    <th className="px-5 py-4 text-[10px] font-black uppercase tracking-[0.12em] text-slate-400">Published</th>
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
                                                <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center text-brand-600 border border-brand-100/50 flex-shrink-0 group-hover:bg-brand-500 group-hover:text-white transition-all matte-shadow">
                                                    <Newspaper size={18} />
                                                </div>
                                                <div>
                                                    <div className="text-sm font-black text-slate-800 max-w-[200px] truncate">{item.title}</div>
                                                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter mt-0.5">ID: #{item.id}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-5 py-4 text-xs font-bold text-slate-400 max-w-[220px]">
                                            <span className="line-clamp-2">{item.description}</span>
                                        </td>
                                        <td className="px-5 py-4">
                                            {item.image ? (
                                                <img src={resolveImage(item.image)} alt={item.title} className="w-14 h-10 object-cover rounded-xl border border-surface-100" />
                                            ) : (
                                                <div className="w-14 h-10 bg-surface-50 rounded-xl border border-surface-100 flex items-center justify-center">
                                                    <Image size={16} className="text-slate-300" />
                                                </div>
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
                                                <button className="p-2.5 rounded-xl bg-white text-slate-400 hover:text-brand-600 hover:bg-brand-50 transition-all border border-surface-100 matte-shadow" title="View Article">
                                                    <Eye size={15} />
                                                </button>
                                                <button className="p-2.5 rounded-xl bg-white text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all border border-surface-100 matte-shadow" title="Edit Article">
                                                    <Edit2 size={15} />
                                                </button>
                                                <button className="p-2.5 rounded-xl bg-white text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all border border-surface-100 matte-shadow" title="Delete Article">
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
                                className="bg-white rounded-3xl border border-surface-100 matte-shadow overflow-hidden flex flex-col"
                            >
                                <div className="h-40 relative bg-slate-50 border-b border-slate-100 flex items-center justify-center overflow-hidden">
                                            {item.image ? (
                                        <img src={resolveImage(item.image)} alt={item.title} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="flex flex-col items-center gap-2">
                                            <Newspaper size={40} className="text-slate-200" />
                                            <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">No Cover Image</span>
                                        </div>
                                    )}
                                    <div className="absolute top-4 left-4 px-3 py-1 bg-white/90 backdrop-blur-md rounded-lg text-[10px] font-black text-slate-800 shadow-sm border border-white/50">
                                        ID #{item.id}
                                    </div>
                                </div>
                                <div className="p-6 flex-1 flex flex-col">
                                    <div className="flex items-center gap-2 mb-3">
                                        <Calendar size={12} className="text-slate-400" />
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                            {new Date(item.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}
                                        </span>
                                    </div>
                                    <h3 className="text-lg font-black text-slate-800 mb-3 line-clamp-2">{item.title}</h3>
                                    <p className="text-sm font-medium text-slate-500 mb-6 line-clamp-3 leading-relaxed flex-1">
                                        {item.description}
                                    </p>
                                    <div className="flex gap-2">
                                        <button className="flex-1 py-3 bg-brand-50 text-brand-600 rounded-xl font-black text-xs hover:bg-brand-100 transition-colors">View Details</button>
                                        <button className="px-4 bg-slate-50 text-slate-400 rounded-xl hover:bg-slate-100 transition-colors border border-slate-100"><Edit2 size={16} /></button>
                                        <button className="px-4 bg-rose-50 text-rose-500 rounded-xl hover:bg-rose-100 transition-colors border border-rose-100"><Trash2 size={16} /></button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                    <Pagination page={pg.page} pageSize={pg.pageSize} total={pg.total} totalPages={pg.totalPages} startIndex={pg.startIndex} endIndex={pg.endIndex} onPageChange={pg.setPage} onPageSizeChange={pg.setPageSize} />
                </div>
            )}

            <CreateNewsModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSuccess={fetchNews}
            />
        </div>
    );
};

export default NewsPage;




