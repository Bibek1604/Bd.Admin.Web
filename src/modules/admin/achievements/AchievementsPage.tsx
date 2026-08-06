import React, { useState, useEffect } from 'react';
import Pagination from '../../../components/ui/Pagination';
import { usePagination } from '../../../hooks/usePagination';
import { Star, Plus, Search, Calendar, Award, TrendingUp, Trash2, User } from 'lucide-react';
import { achievementsService } from './achievementsService';
import type { Achievement, UserAchievement } from './achievementsService';
import CreateAchievementModal from './CreateAchievementModal';
import { motion } from 'framer-motion';

const AchievementsPage: React.FC = () => {
    const [achievements, setAchievements] = useState<Achievement[]>([]);
    const [userAchievements, setUserAchievements] = useState<UserAchievement[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
    const [activeTab, setActiveTab] = useState<'MILESTONES' | 'ACHIEVED'>('MILESTONES');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    const fetchAllData = async () => {
        setLoading(true);
        try {
            const [milestones, achieved] = await Promise.all([
                achievementsService.getAll(),
                achievementsService.getUserAchievements()
            ]);
            setAchievements(milestones);
            setUserAchievements(achieved);
        } catch (err) {
            console.error('Failed to load achievements', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchAllData(); }, []);

    const filteredAchievements = achievements.filter(item =>
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase())
    ).sort((a, b) => { const ta = new Date(a.created_at).getTime(); const tb = new Date(b.created_at).getTime(); return sortOrder === 'newest' ? tb - ta : ta - tb; });

    const filteredReceived = userAchievements.filter(item =>
        item.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.achievement_title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const pgA = usePagination(filteredAchievements);
    const pgR = usePagination(filteredReceived);

    return (
        <div className="w-full max-w-7xl mx-auto space-y-8 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6">
                <div>
                    <div className="flex items-center gap-2 text-amber-600 font-black text-xs uppercase tracking-widest bg-amber-50 w-fit px-4 py-1.5 rounded-full border border-amber-100/50 mb-4">
                        <Award size={16} /> Achievements
                    </div>
                    <h1 className="text-3xl font-extrabold text-slate-800 tracking-tighter">Agent Achievements</h1>
                    <p className="text-sm text-slate-400 mt-2 font-medium">Create and manage achievements to reward your agents.</p>
                </div>
                <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="px-8 bg-amber-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-amber-600 transition-all shadow-xl shadow-amber-100 flex items-center gap-3 shrink-0"
                >
                    <Plus size={16} /> New Milestone
                </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 p-1.5 bg-white rounded-2xl border border-surface-100 matte-shadow w-fit">
                <button
                    onClick={() => setActiveTab('MILESTONES')}
                    className={`px-6 py-2.5 rounded-xl font-black text-[11px] uppercase tracking-widest transition-all ${activeTab === 'MILESTONES' ? 'bg-amber-500 text-white shadow-lg shadow-amber-100' : 'text-slate-400 hover:text-slate-600 hover:bg-surface-50'}`}
                >
                    Defined Milestones <span className="ml-1 opacity-70">({achievements.length})</span>
                </button>
                <button
                    onClick={() => setActiveTab('ACHIEVED')}
                    className={`px-6 py-2.5 rounded-xl font-black text-[11px] uppercase tracking-widest transition-all ${activeTab === 'ACHIEVED' ? 'bg-brand-600 text-white shadow-lg shadow-brand-100' : 'text-slate-400 hover:text-slate-600 hover:bg-surface-50'}`}
                >
                    Unlocked Milestones <span className="ml-1 opacity-70">({userAchievements.length})</span>
                </button>
            </div>

            {/* Search */}
            <div className="bg-white rounded-2xl px-6 py-4 border border-surface-100 matte-shadow flex items-center gap-4">
                <Search size={18} className="text-slate-300" />
                <input
                    type="text"
                    placeholder="Search achievements or agents..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="flex-1 bg-transparent border-none outline-none text-sm font-bold text-slate-700 placeholder:text-slate-300"
                />
                <select value={sortOrder} onChange={e => setSortOrder(e.target.value as 'newest' | 'oldest')} title="Filter by date" aria-label="Filter by date" className="rounded-lg border border-surface-100 bg-surface-50 px-3 py-1.5 text-xs font-bold text-slate-600 outline-none cursor-pointer">
                    <option value="newest">Newest first</option>
                    <option value="oldest">Oldest first</option>
                </select>
            </div>

            {/* Table / Cards Content */}
            {loading ? (
                <div className="py-24 text-center text-slate-300 font-bold italic animate-pulse">Loading achievements...</div>
            ) : activeTab === 'MILESTONES' ? (
                filteredAchievements.length === 0 ? (
                    <div className="py-24 text-center bg-white rounded-3xl border-2 border-dashed border-surface-100">
                        <div className="text-6xl mb-6 grayscale opacity-40">🏆</div>
                        <h3 className="text-xl font-black text-slate-800 mb-2">No achievements yet</h3>
                        <p className="text-sm font-medium text-slate-400">Create your first achievement to start rewarding agents.</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {/* Desktop View */}
                        <div className="hidden lg:block overflow-hidden bg-white rounded-3xl border border-surface-100 matte-shadow">
                            <table className="w-full border-collapse text-left">
                                <thead>
                                    <tr className="bg-surface-50/70 border-b border-surface-100">
                                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.12em] text-slate-400">Milestone</th>
                                        <th className="px-5 py-4 text-[10px] font-black uppercase tracking-[0.12em] text-slate-400">Description</th>
                                        <th className="px-5 py-4 text-[10px] font-black uppercase tracking-[0.12em] text-slate-400">XP Required</th>
                                        <th className="px-5 py-4 text-[10px] font-black uppercase tracking-[0.12em] text-slate-400">Created</th>
                                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.12em] text-slate-400 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-surface-100/70">
                                    {pgA.pageItems.map((item, i) => (
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
                                                    <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-500 border border-amber-100/50 shrink-0">
                                                        <Star size={18} />
                                                    </div>
                                                    <div className="font-black text-sm text-slate-800">{item.title}</div>
                                                </div>
                                            </td>
                                            <td className="px-5 py-4 text-xs font-bold text-slate-400 max-w-55">
                                                <span className="line-clamp-2">{item.description}</span>
                                            </td>
                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-2 text-xs font-black text-amber-600">
                                                    <TrendingUp size={13} />
                                                    {item.required_xp} XP
                                                </div>
                                            </td>
                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                                                    <Calendar size={12} className="opacity-60" />
                                                    {new Date(item.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <button className="px-4 py-2.5 rounded-xl bg-white text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-all border border-surface-100 matte-shadow text-[10px] font-black uppercase tracking-widest">
                                                        Configure
                                                    </button>
                                                    <button title="Delete milestone" className="p-2.5 rounded-xl bg-white text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all border border-surface-100 matte-shadow">
                                                        <Trash2 size={15} />
                                                    </button>
                                                </div>
                                            </td>
                                        </motion.tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile View */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:hidden gap-6">
                            {pgA.pageItems.map((item, i) => (
                                <motion.div
                                    key={item.id}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    whileInView={{ opacity: 1, scale: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.05 }}
                                    className="bg-white rounded-3xl border border-surface-100 matte-shadow p-6"
                                >
                                    <div className="flex items-center justify-between mb-5">
                                        <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600 border border-amber-100">
                                            <Star size={22} />
                                        </div>
                                        <div className="flex flex-col items-end">
                                            <span className="text-[10px] font-black text-amber-600 uppercase tracking-widest bg-amber-50 px-2 py-1 rounded-md border border-amber-100">
                                                {item.required_xp} XP
                                            </span>
                                        </div>
                                    </div>
                                    <h3 className="text-lg font-black text-slate-800 mb-2">{item.title}</h3>
                                    <p className="text-sm font-medium text-slate-500 mb-6 line-clamp-3 leading-relaxed">
                                        {item.description}
                                    </p>
                                    <div className="flex gap-2">
                                        <button className="flex-1 py-3 bg-amber-500 text-white rounded-xl font-black text-xs shadow-lg shadow-amber-100">Configure</button>
                                        <button className="px-4 bg-rose-50 text-rose-500 rounded-xl border border-rose-100"><Trash2 size={16} /></button>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                        <Pagination page={pgA.page} pageSize={pgA.pageSize} total={pgA.total} totalPages={pgA.totalPages} startIndex={pgA.startIndex} endIndex={pgA.endIndex} onPageChange={pgA.setPage} onPageSizeChange={pgA.setPageSize} />
                    </div>
                )
            ) : (
                filteredReceived.length === 0 ? (
                    <div className="py-24 text-center bg-white rounded-3xl border-2 border-dashed border-surface-100">
                        <div className="text-6xl mb-6 grayscale opacity-40">🎖️</div>
                        <h3 className="text-xl font-black text-slate-800 mb-2">No achievements earned yet</h3>
                        <p className="text-sm font-medium text-slate-400">Agents will appear here once they earn achievements.</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {/* Desktop View */}
                        <div className="hidden lg:block overflow-hidden bg-white rounded-3xl border border-surface-100 matte-shadow">
                            <table className="w-full border-collapse text-left">
                                <thead>
                                    <tr className="bg-surface-50/70 border-b border-surface-100">
                                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.12em] text-slate-400">Achievement</th>
                                        <th className="px-5 py-4 text-[10px] font-black uppercase tracking-[0.12em] text-slate-400">Agent</th>
                                        <th className="px-5 py-4 text-[10px] font-black uppercase tracking-[0.12em] text-slate-400">Unlocked On</th>
                                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.12em] text-slate-400 text-right">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-surface-100/70">
                                    {pgR.pageItems.map((req, i) => (
                                        <motion.tr
                                            key={req.id}
                                            initial={{ opacity: 0, y: 8 }}
                                            whileInView={{ opacity: 1, y: 0 }}
                                            viewport={{ once: true }}
                                            transition={{ delay: i * 0.03 }}
                                            className="hover:bg-surface-50/80 transition-colors"
                                        >
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 border border-emerald-100/50 shrink-0">
                                                        <Award size={18} />
                                                    </div>
                                                    <div className="font-black text-sm text-slate-800">{req.achievement_title}</div>
                                                </div>
                                            </td>
                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
                                                    <User size={13} className="text-slate-300" />
                                                    {req.username}
                                                </div>
                                            </td>
                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                                                    <Calendar size={12} className="opacity-60" />
                                                    {new Date(req.unlocked_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <span className="px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-widest border border-emerald-100">
                                                    Unlocked
                                                </span>
                                            </td>
                                        </motion.tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile View */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:hidden gap-6">
                            {pgR.pageItems.map((req, i) => (
                                <motion.div
                                    key={req.id}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    whileInView={{ opacity: 1, scale: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.05 }}
                                    className="bg-white rounded-3xl border border-surface-100 matte-shadow p-6"
                                >
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 border border-emerald-100">
                                            <Award size={22} />
                                        </div>
                                        <span className="px-3 py-1 rounded-lg bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-widest border border-emerald-100">
                                            Active Reward
                                        </span>
                                    </div>
                                    <h3 className="text-lg font-black text-slate-800 mb-1">{req.achievement_title}</h3>
                                    <div className="flex items-center gap-2 text-xs font-bold text-slate-400 mb-6">
                                        <User size={12} />
                                        Earned by <span className="text-brand-600">@{req.username}</span>
                                    </div>
                                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                        <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                                            <Calendar size={13} />
                                            Unlocked On
                                        </div>
                                        <div className="text-xs font-black text-slate-800">
                                            {new Date(req.unlocked_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                        <Pagination page={pgR.page} pageSize={pgR.pageSize} total={pgR.total} totalPages={pgR.totalPages} startIndex={pgR.startIndex} endIndex={pgR.endIndex} onPageChange={pgR.setPage} onPageSizeChange={pgR.setPageSize} />
                    </div>
                )
            )}

            <CreateAchievementModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSuccess={fetchAllData}
            />
        </div>
    );
};

export default AchievementsPage;




