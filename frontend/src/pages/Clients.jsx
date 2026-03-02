import React, { useState, useEffect } from 'react';
import { Plus, Search, Eye, Edit, Trash2, Phone, Mail, Users } from 'lucide-react';
import Layout from '../components/Layout/Layout';
import Modal from '../components/UI/Modal';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import EmptyState from '../components/UI/EmptyState';
import Pagination from '../components/UI/Pagination';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { Link, useSearchParams } from 'react-router-dom';

const ClientForm = ({ initial, onSave, onClose }) => {
  const [form, setForm] = useState(initial || {
    fullName: '', nationalId: '', phone: '', email: '', kraPin: '',
    address: '', occupation: '', businessName: '',
    nextOfKinName: '', nextOfKinPhone: '', nextOfKinRelationship: '', notes: '',
  });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (initial?.id) await api.put(`/clients/${initial.id}`, form);
      else await api.post('/clients', form);
      toast.success(initial ? 'Client updated!' : 'Client created!');
      onSave();
    } catch (err) { toast.error(err.response?.data?.message || 'Error saving client'); }
  };

  const Field = ({ label, k, type = 'text', required }) => (
    <div>
      <label className="label">{label}{required && <span className="text-red-500">*</span>}</label>
      <input type={type} className="input" value={form[k] || ''} onChange={e => set(k, e.target.value)} required={required} />
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Field label="Full Name" k="fullName" required />
        <Field label="National ID" k="nationalId" />
        <Field label="Phone" k="phone" required />
        <Field label="Email" k="email" type="email" />
        <Field label="KRA PIN" k="kraPin" />
        <Field label="Occupation" k="occupation" />
        <Field label="Business Name" k="businessName" />
        <Field label="Address" k="address" />
        <Field label="Next of Kin Name" k="nextOfKinName" />
        <Field label="Next of Kin Phone" k="nextOfKinPhone" />
        <Field label="Relationship" k="nextOfKinRelationship" />
      </div>
      <div>
        <label className="label">Notes</label>
        <textarea className="input" rows={2} value={form.notes || ''} onChange={e => set('notes', e.target.value)} />
      </div>
      <div className="flex gap-3 justify-end pt-2">
        <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
        <button type="submit" className="btn-primary">{initial ? 'Update Client' : 'Create Client'}</button>
      </div>
    </form>
  );
};

export default function Clients() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ total: 0, pages: 1 });
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const q = searchParams.get('search');
    if (q) setSearch(q);
  }, []);

  const fetchClients = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/clients', { params: { search, page, limit: 20 } });
      setClients(data.data);
      setMeta({ total: data.total, pages: data.pages });
    } catch { toast.error('Failed to load clients'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchClients(); }, [search, page]);

  const handleDelete = async (id) => {
    if (!window.confirm('Archive this client?')) return;
    try { await api.delete(`/clients/${id}`); toast.success('Client archived.'); fetchClients(); }
    catch { toast.error('Failed to archive client'); }
  };

  return (
    <Layout title="Clients">
      <div className="page-header">
        <div>
          <h2 className="page-title">Client Management</h2>
          <p className="text-sm text-gray-500 mt-1">{meta.total} total clients</p>
        </div>
        <button onClick={() => { setEditing(null); setShowForm(true); }} className="btn-primary">
          <Plus size={16} /> Add Client
        </button>
      </div>

      <div className="card mb-4">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input className="input pl-9" placeholder="Search by name, ID, phone, email..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
        </div>
      </div>

      <div className="card p-0">
        {loading ? <LoadingSpinner /> : clients.length === 0 ? (
          <EmptyState icon={Users} title="No clients found" description="Add your first client to get started." action={<button onClick={() => setShowForm(true)} className="btn-primary">Add Client</button>} />
        ) : (
          <>
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr><th>Client</th><th>National ID</th><th>Phone</th><th>Email</th><th>Active Policies</th><th>Actions</th></tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {clients.map(c => (
                    <tr key={c.id}>
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-semibold text-sm">{c.fullName[0]}</div>
                          <div>
                            <div className="font-medium text-gray-900">{c.fullName}</div>
                            {c.businessName && <div className="text-xs text-gray-500">{c.businessName}</div>}
                          </div>
                        </div>
                      </td>
                      <td>{c.nationalId || '-'}</td>
                      <td><a href={`tel:${c.phone}`} className="flex items-center gap-1 text-blue-600 hover:underline"><Phone size={12} />{c.phone}</a></td>
                      <td>{c.email ? <a href={`mailto:${c.email}`} className="flex items-center gap-1 text-blue-600 hover:underline"><Mail size={12} />{c.email}</a> : '-'}</td>
                      <td><span className="badge bg-blue-50 text-blue-700">{c.policies?.length || 0}</span></td>
                      <td>
                        <div className="flex items-center gap-1">
                          <Link to={`/clients/${c.id}`} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg"><Eye size={15} /></Link>
                          <button onClick={() => { setEditing(c); setShowForm(true); }} className="p-1.5 text-gray-600 hover:bg-gray-50 rounded-lg"><Edit size={15} /></button>
                          <button onClick={() => handleDelete(c.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 size={15} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="p-4"><Pagination page={page} pages={meta.pages} total={meta.total} limit={20} onPageChange={setPage} /></div>
          </>
        )}
      </div>

      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title={editing ? 'Edit Client' : 'New Client'} size="lg">
        <ClientForm initial={editing} onSave={() => { setShowForm(false); fetchClients(); }} onClose={() => setShowForm(false)} />
      </Modal>
    </Layout>
  );
}
