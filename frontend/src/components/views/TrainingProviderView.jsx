import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  PlusCircle, 
  Calendar, 
  Users, 
  CheckCircle2, 
  Award, 
  Clock, 
  FileText, 
  Search, 
  RefreshCw, 
  ShieldCheck, 
  AlertCircle,
  TrendingUp,
  UserCheck
} from 'lucide-react';
import apiClient from '../../utils/apiClient';
import LoadingState from '../common/LoadingState';
import EmptyState from '../common/EmptyState';
import ErrorState from '../common/ErrorState';

export default function TrainingProviderView() {
  const [batches, setBatches] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [enrollments, setEnrollments] = useState([]);
  const [loadingBatches, setLoadingBatches] = useState(true);
  const [loadingEnrollments, setLoadingEnrollments] = useState(false);
  const [error, setError] = useState(null);

  // Modals & form state
  const [isCreateBatchOpen, setIsCreateBatchOpen] = useState(false);
  const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false);
  const [isCompleteModalOpen, setIsCompleteModalOpen] = useState(false);
  const [activeEnrollment, setActiveEnrollment] = useState(null);

  const [batchForm, setBatchForm] = useState({
    course_name: '',
    qp_code: 'SSC/Q8102',
    training_centre_id: 1,
    start_date: new Date().toISOString().split('T')[0],
    end_date: new Date(Date.now() + 90 * 86400000).toISOString().split('T')[0],
    max_capacity: 30
  });

  const [attendanceForm, setAttendanceForm] = useState({
    date: new Date().toISOString().split('T')[0],
    status: 'present'
  });

  const [completionForm, setCompletionForm] = useState({
    certificate_id: '',
    assessment_score: 85
  });

  const [submitting, setSubmitting] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState(null);

  const fetchBatches = async () => {
    setLoadingBatches(true);
    setError(null);
    try {
      const res = await apiClient.getProviderBatches();
      const list = res.data?.batches || [];
      setBatches(list);
      if (list.length > 0 && !selectedBatch) {
        setSelectedBatch(list[0]);
      }
    } catch (err) {
      setError(err.message || 'Failed to load training batches.');
    } finally {
      setLoadingBatches(false);
    }
  };

  const fetchEnrollments = async (batchId) => {
    if (!batchId) return;
    setLoadingEnrollments(true);
    try {
      const res = await apiClient.getBatchEnrollments(batchId);
      setEnrollments(res.data?.enrollments || []);
    } catch (err) {
      console.error('Failed to load enrollments:', err);
    } finally {
      setLoadingEnrollments(false);
    }
  };

  useEffect(() => {
    fetchBatches();
  }, []);

  useEffect(() => {
    if (selectedBatch) {
      fetchEnrollments(selectedBatch.id);
    }
  }, [selectedBatch]);

  const handleCreateBatch = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await apiClient.createProviderBatch({
        ...batchForm,
        start_date: new Date(batchForm.start_date).toISOString(),
        end_date: new Date(batchForm.end_date).toISOString(),
        max_capacity: parseInt(batchForm.max_capacity, 10)
      });
      setFeedbackMsg('Training batch created successfully!');
      setIsCreateBatchOpen(false);
      fetchBatches();
    } catch (err) {
      alert(`Create batch failed: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateAttendance = async (e) => {
    e.preventDefault();
    if (!activeEnrollment) return;
    setSubmitting(true);
    try {
      await apiClient.updateBatchAttendance(activeEnrollment.enrollment_id, {
        date: attendanceForm.date,
        status: attendanceForm.status
      });
      setFeedbackMsg(`Attendance marked (${attendanceForm.status}) for ${activeEnrollment.candidate_name}!`);
      setIsAttendanceModalOpen(false);
      if (selectedBatch) fetchEnrollments(selectedBatch.id);
    } catch (err) {
      alert(`Attendance update failed: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCompleteEnrollment = async (e) => {
    e.preventDefault();
    if (!activeEnrollment) return;
    setSubmitting(true);
    try {
      await apiClient.completeBatchEnrollment(activeEnrollment.enrollment_id, {
        certificate_id: completionForm.certificate_id || `CERT-${Date.now().toString().slice(-6)}`,
        assessment_score: parseFloat(completionForm.assessment_score)
      });
      setFeedbackMsg(`Candidate marked as completed with certificate issued!`);
      setIsCompleteModalOpen(false);
      if (selectedBatch) fetchEnrollments(selectedBatch.id);
    } catch (err) {
      alert(`Completion failed: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-amber-600 font-bold text-xs uppercase tracking-wider mb-1">
            <Building2 className="w-4 h-4" />
            <span>Training Partner Portal</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Course & Batch Administration
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage NSQF batches, track biometric & daily attendance, and issue validated course completions.
          </p>
        </div>

        <button
          onClick={() => setIsCreateBatchOpen(true)}
          className="px-4 py-2.5 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-bold text-xs rounded-xl shadow-md shadow-amber-500/20 flex items-center gap-2 transition"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Create New Batch</span>
        </button>
      </div>

      {feedbackMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs font-semibold text-emerald-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{feedbackMsg}</span>
          </div>
          <button onClick={() => setFeedbackMsg(null)} className="text-emerald-600 hover:underline">
            Dismiss
          </button>
        </div>
      )}

      {/* Main Grid: Batches on Left, Candidate Enrollments on Right */}
      {loadingBatches ? (
        <LoadingState message="Loading training batches..." height="h-64" />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchBatches} />
      ) : batches.length === 0 ? (
        <EmptyState
          title="No batches created yet"
          description="Create your first PMKVY or state-funded training batch to start enrolling candidates."
          actionText="Create First Batch"
          onAction={() => setIsCreateBatchOpen(true)}
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Batches Selector (4 columns) */}
          <div className="lg:col-span-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">
                Active Batches ({batches.length})
              </span>
              <button
                onClick={fetchBatches}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-500 transition"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-2.5">
              {batches.map((b) => {
                const isSelected = selectedBatch?.id === b.id;
                return (
                  <button
                    key={b.id}
                    onClick={() => setSelectedBatch(b)}
                    className={`w-full text-left p-4 rounded-2xl border transition ${
                      isSelected
                        ? 'bg-amber-50/70 border-amber-300 ring-2 ring-amber-400/20 shadow-sm'
                        : 'bg-white border-slate-200/80 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-extrabold text-xs text-slate-900">{b.course_name}</h3>
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                        b.status === 'in_progress'
                          ? 'bg-blue-50 text-blue-700'
                          : b.status === 'completed'
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-slate-100 text-slate-600'
                      }`}>
                        {b.status}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-2">
                      <span className="font-mono text-slate-700 font-bold">{b.qp_code}</span>
                      <span>•</span>
                      <span>{b.enrolled_count || 0} / {b.max_capacity} Enrolled</span>
                    </div>

                    <div className="flex items-center gap-1 text-[10px] text-slate-400 mt-1.5">
                      <Calendar className="w-3 h-3" />
                      <span>{new Date(b.start_date).toLocaleDateString()} — {new Date(b.end_date).toLocaleDateString()}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Batch Candidates & Attendance Table (8 columns) */}
          <div className="lg:col-span-8 bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-4">
            {selectedBatch ? (
              <>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
                  <div>
                    <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider">
                      Batch Details
                    </span>
                    <h2 className="text-lg font-black text-slate-900">{selectedBatch.course_name}</h2>
                    <p className="text-xs text-slate-500">
                      QP Code: <span className="font-mono font-bold text-slate-700">{selectedBatch.qp_code}</span> • Status: <span className="font-semibold text-slate-700">{selectedBatch.status}</span>
                    </p>
                  </div>
                </div>

                {/* Candidate Enrollments Table */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800">
                      Enrolled Candidates ({enrollments.length})
                    </span>
                  </div>

                  {loadingEnrollments ? (
                    <LoadingState message="Loading candidate roster..." height="h-40" />
                  ) : enrollments.length === 0 ? (
                    <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                      <Users className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                      <p className="text-xs font-bold text-slate-700">No candidates enrolled yet</p>
                      <p className="text-[11px] text-slate-400">Candidates who register or are assigned will appear here.</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="border-b border-slate-200 bg-slate-50/60 text-slate-500 text-[11px] font-bold">
                            <th className="py-2.5 px-3">Candidate</th>
                            <th className="py-2.5 px-3">Phone</th>
                            <th className="py-2.5 px-3">Attendance</th>
                            <th className="py-2.5 px-3">Status</th>
                            <th className="py-2.5 px-3 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {enrollments.map((enr) => (
                            <tr key={enr.enrollment_id} className="hover:bg-slate-50/80 transition">
                              <td className="py-3 px-3">
                                <div className="font-bold text-slate-900">{enr.candidate_name}</div>
                                <div className="text-[10px] text-slate-400">ID: #{enr.candidate_user_id}</div>
                              </td>

                              <td className="py-3 px-3 text-slate-600 font-mono text-[11px]">
                                {enr.candidate_phone || 'N/A'}
                              </td>

                              <td className="py-3 px-3">
                                <span className="font-bold text-slate-800">
                                  {enr.attendance_percentage ? `${enr.attendance_percentage}%` : 'N/A'}
                                </span>
                              </td>

                              <td className="py-3 px-3">
                                <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                                  enr.status === 'completed'
                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                    : 'bg-blue-50 text-blue-700'
                                }`}>
                                  {enr.status}
                                </span>
                              </td>

                              <td className="py-3 px-3 text-right space-x-1">
                                <button
                                  onClick={() => {
                                    setActiveEnrollment(enr);
                                    setIsAttendanceModalOpen(true);
                                  }}
                                  className="px-2 py-1 rounded-lg border border-slate-200 hover:bg-slate-100 text-[10px] font-bold text-slate-700"
                                >
                                  Mark Attendance
                                </button>

                                {enr.status !== 'completed' && (
                                  <button
                                    onClick={() => {
                                      setActiveEnrollment(enr);
                                      setIsCompleteModalOpen(true);
                                    }}
                                    className="px-2 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold"
                                  >
                                    Mark Complete
                                  </button>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="p-8 text-center text-slate-400">
                Select a batch from the left to view enrollments.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal 1: Create Batch */}
      {isCreateBatchOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h2 className="text-base font-black text-slate-900">Create NSQF Training Batch</h2>
              <button onClick={() => setIsCreateBatchOpen(false)} className="text-slate-400 hover:text-slate-600 font-bold">✕</button>
            </div>

            <form onSubmit={handleCreateBatch} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Course / Trade Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. AI Associate NSQF Level 5 Batch"
                  value={batchForm.course_name}
                  onChange={(e) => setBatchForm({ ...batchForm, course_name: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">QP Code *</label>
                  <input
                    type="text"
                    required
                    value={batchForm.qp_code}
                    onChange={(e) => setBatchForm({ ...batchForm, qp_code: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Max Capacity</label>
                  <input
                    type="number"
                    min={5}
                    max={100}
                    value={batchForm.max_capacity}
                    onChange={(e) => setBatchForm({ ...batchForm, max_capacity: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Start Date</label>
                  <input
                    type="date"
                    value={batchForm.start_date}
                    onChange={(e) => setBatchForm({ ...batchForm, start_date: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">End Date</label>
                  <input
                    type="date"
                    value={batchForm.end_date}
                    onChange={(e) => setBatchForm({ ...batchForm, end_date: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCreateBatchOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold"
                >
                  {submitting ? 'Creating...' : 'Create Batch'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Mark Attendance */}
      {isAttendanceModalOpen && activeEnrollment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div>
                <h2 className="text-base font-black text-slate-900">Mark Attendance</h2>
                <p className="text-[11px] text-slate-500">For {activeEnrollment.candidate_name}</p>
              </div>
              <button onClick={() => setIsAttendanceModalOpen(false)} className="text-slate-400 hover:text-slate-600 font-bold">✕</button>
            </div>

            <form onSubmit={handleUpdateAttendance} className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Date</label>
                <input
                  type="date"
                  value={attendanceForm.date}
                  onChange={(e) => setAttendanceForm({ ...attendanceForm, date: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Attendance Status</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setAttendanceForm({ ...attendanceForm, status: 'present' })}
                    className={`py-2 rounded-xl font-bold border transition ${
                      attendanceForm.status === 'present'
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-400 ring-2 ring-emerald-500/20'
                        : 'border-slate-200 text-slate-600'
                    }`}
                  >
                    Present (P)
                  </button>
                  <button
                    type="button"
                    onClick={() => setAttendanceForm({ ...attendanceForm, status: 'absent' })}
                    className={`py-2 rounded-xl font-bold border transition ${
                      attendanceForm.status === 'absent'
                        ? 'bg-rose-50 text-rose-800 border-rose-400 ring-2 ring-rose-500/20'
                        : 'border-slate-200 text-slate-600'
                    }`}
                  >
                    Absent (A)
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAttendanceModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold"
                >
                  {submitting ? 'Saving...' : 'Save Attendance'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 3: Mark Completion */}
      {isCompleteModalOpen && activeEnrollment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div>
                <h2 className="text-base font-black text-slate-900">Mark Course Completion</h2>
                <p className="text-[11px] text-slate-500">For {activeEnrollment.candidate_name}</p>
              </div>
              <button onClick={() => setIsCompleteModalOpen(false)} className="text-slate-400 hover:text-slate-600 font-bold">✕</button>
            </div>

            <form onSubmit={handleCompleteEnrollment} className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Certificate ID / Serial Number</label>
                <input
                  type="text"
                  placeholder="e.g. TN-SDC-2026-89421"
                  value={completionForm.certificate_id}
                  onChange={(e) => setCompletionForm({ ...completionForm, certificate_id: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Final Assessment Score (%)</label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={completionForm.assessment_score}
                  onChange={(e) => setCompletionForm({ ...completionForm, assessment_score: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCompleteModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                >
                  {submitting ? 'Certifying...' : 'Complete & Certify'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
