import React, { useState, useMemo } from 'react';
import Pagination from '../../../components/ui/Pagination';
import { usePagination } from '../../../hooks/usePagination';
import { useAgents } from './useAgents';
import { Search, Filter, RefreshCcw, Shield, Plus } from 'lucide-react';
import SendAlertModal from './SendAlertModal';
import AgentsTable from './AgentsTable';
import AgentModal from './AgentModal';
import { motion } from 'framer-motion';

const AgentsPage: React.FC = () => {
  const { agents, loading, error, refresh, create, update, remove } = useAgents();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'All' | 'High Performance'>('All');
  const [selectedAgent, setSelectedAgent] = useState<any | null>(null);
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
  
  // CRUD Modal State
  const [isAgentModalOpen, setIsAgentModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'details'>('create');

  const filteredAgents = useMemo(() => {
    return (agents || []).filter(agent => {
      const matchesSearch = agent.username.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            agent.first_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            agent.last_name.toLowerCase().includes(searchTerm.toLowerCase());
      
      const isHighPerf = activeTab === 'High Performance' ? (agent.agent_profile?.performance_score || 0) >= 80 : true;
      
      return matchesSearch && isHighPerf;
    });
  }, [agents, searchTerm, activeTab]);

  const pg = usePagination(filteredAgents);
  const handleOpenModal = (mode: 'create' | 'edit' | 'details', agent?: any) => {
    setModalMode(mode);
    setSelectedAgent(agent || null);
    setIsAgentModalOpen(true);
  };

  const handleModalSubmit = async (data: any) => {
    if (modalMode === 'create') {
      const newAgent = await create(data);
      // Land on the new agent's profile instead of just closing the modal
      setSelectedAgent(newAgent);
      setModalMode('details');
    } else if (modalMode === 'edit' && selectedAgent) {
      await update(selectedAgent.id, data);
    }
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Are you sure you want to delete this agent? This cannot be undone.')) {
      remove(id);
    }
  };

  if (error) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center bg-white rounded-3xl border border-surface-100 matte-shadow animate-fade-in">
      <div className="w-20 h-20 rounded-3xl bg-rose-50 flex items-center justify-center text-rose-500 mb-6 shadow-xl shadow-rose-100">
        <Shield size={40} />
      </div>
      <h2 className="text-2xl font-black text-slate-800 mb-2 tracking-tight">Couldn't load agents</h2>
      <p className="text-sm font-medium text-slate-400 max-w-sm mx-auto mb-8 leading-relaxed">{error}</p>
      <button 
        onClick={() => refresh()} 
        className="flex items-center gap-3 px-8 bg-brand-600 text-white rounded-2xl font-black text-sm tracking-tight hover:bg-brand-700 transition-all hover:scale-105 shadow-xl shadow-brand-100"
      >
        <RefreshCcw size={18} /> Re-establish Feed
      </button>
    </div>
  );

  return (
    <div className="w-full max-w-[1500px] mx-auto space-y-10 animate-fade-in">
      <header className="flex flex-col gap-8 sm:flex-row sm:items-end sm:justify-between px-2">
        <div className="space-y-3">
          <div className="flex items-center gap-3 text-brand-600 font-black text-xs uppercase tracking-widest bg-brand-50 w-fit px-4 py-1.5 rounded-full border border-brand-100/50">
             <div className="w-2 h-2 rounded-full bg-brand-500 matte-shadow animate-pulse" />
             Agents
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-800 tracking-tighter">Agents</h1>
          <p className="text-sm md:text-base font-medium text-slate-400 leading-relaxed max-w-xl">View and manage your agents, and send them alerts.</p>
        </div>
        
        <div className="flex p-1.5 bg-white rounded-2xl border border-surface-100 matte-shadow w-fit">
            <button 
                onClick={() => setActiveTab('All')}
                className={`px-5 py-4 py-2.5 rounded-xl font-black text-[12px] uppercase tracking-tighter transition-all ${activeTab === 'All' ? 'bg-brand-600 text-white shadow-lg shadow-brand-100' : 'text-slate-400 hover:text-slate-600 hover:bg-surface-50'}`}
            >
                All Agents
            </button>
            <button 
                onClick={() => setActiveTab('High Performance')}
                className={`px-5 py-4 py-2.5 rounded-xl font-black text-[12px] uppercase tracking-tighter transition-all flex items-center gap-2 ${activeTab === 'High Performance' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'text-slate-400 hover:text-slate-600 hover:bg-surface-50'}`}
            >
                <div className={`w-1.5 h-1.5 rounded-full ${activeTab === 'High Performance' ? 'bg-brand-200' : 'bg-slate-300'}`} />
                Top Performers
            </button>
        </div>

        <button 
          onClick={() => handleOpenModal('create')}
          className="px-8 h-12 px-6 bg-brand-600 hover:bg-brand-700 text-white rounded-2xl font-extrabold text-sm tracking-tight transition-all hover:scale-105 shadow-xl shadow-brand-200 flex items-center gap-2"
        >
          <Plus size={16} /> 
          Register New Agent
        </button>
      </header>

      {/* Control Panel */}
      <div className="group bg-white p-6 md:p-8 rounded-3xl border border-surface-100 matte-shadow focus-within:shadow-xl transition-all">
        <div className="relative">
          <div className="absolute left-5 top-1/2 -translate-y-1/2 p-2 bg-surface-50 rounded-xl text-slate-400 transition-colors group-focus-within:text-brand-500">
            <Search size={22} className="opacity-60" />
          </div>
          <input
            type="text"
            placeholder="Search agents by name, username, or license..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-16 py-5.5 bg-surface-50/50 rounded-[1.5rem] border-2 border-transparent outline-none text-base md:text-lg font-bold text-slate-800 placeholder:text-slate-300 focus:bg-white focus:border-brand-500/20 transition-all font-poppins tracking-tight shadow-inner"
          />
          <div className="absolute right-5 top-1/2 -translate-y-1/2 hidden md:flex items-center gap-4 text-xs font-black text-slate-400 uppercase tracking-widest px-4 border-l border-surface-200">
            <Filter size={16} /> Filtered Views
          </div>
        </div>
      </div>

      {loading && filteredAgents.length === 0 ? (
          <div className="py-24 text-center space-y-6">
              <div className="relative w-20 h-20 mx-auto">
                 <div className="w-full h-full border-[6px] border-brand-50 border-t-brand-600 rounded-full animate-spin shadow-inner" />
                 <div className="absolute inset-4 rounded-full bg-brand-50 animate-pulse" />
              </div>
              <p className="font-extrabold text-slate-400 tracking-tighter text-sm uppercase">Loading agents...</p>
          </div>
      ) : filteredAgents.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-24 text-center bg-white rounded-[3.5rem] border-4 border-dashed border-surface-50 p-12">
              <div className="text-7xl mb-8 opacity-80 antialiased drop-shadow-2xl">👥</div>
              <h3 className="text-2xl font-black text-slate-800 mb-3 tracking-tighter uppercase">No agents found</h3>
              <p className="text-sm font-medium text-slate-400 max-w-sm mx-auto leading-relaxed">No agents match your search. Try adjusting your filters.</p>
          </motion.div>
      ) : (
          <>
          <AgentsTable 
            data={pg.pageItems}
            onSendAlert={(agent) => { setSelectedAgent(agent); setIsAlertModalOpen(true); }}
            onView={(agent) => handleOpenModal('details', agent)}
            onEdit={(agent) => handleOpenModal('edit', agent)}
            onDelete={handleDelete}
          />
          <Pagination
            page={pg.page}
            pageSize={pg.pageSize}
            total={pg.total}
            totalPages={pg.totalPages}
            startIndex={pg.startIndex}
            endIndex={pg.endIndex}
            onPageChange={pg.setPage}
            onPageSizeChange={pg.setPageSize}
          />
          </>
      )}

      <SendAlertModal 
        isOpen={isAlertModalOpen} 
        onClose={() => { setIsAlertModalOpen(false); setSelectedAgent(null); }} 
        agent={selectedAgent} 
      />

      <AgentModal
        isOpen={isAgentModalOpen}
        onClose={() => { setIsAgentModalOpen(false); setSelectedAgent(null); }}
        onSubmit={handleModalSubmit}
        agent={selectedAgent}
        mode={modalMode}
      />
    </div>
  );
};

export default AgentsPage;




