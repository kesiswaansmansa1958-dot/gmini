/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { CorrectionRequest } from "../types";
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  MessageSquare, 
  AlertCircle, 
  Send, 
  ArrowRight, 
  User, 
  Layers, 
  Check, 
  X,
  ChevronDown,
  ChevronRight
} from "lucide-react";

interface RequestManagerProps {
  requests: CorrectionRequest[];
  onApprove: (id: string | string[]) => void;
  onReject: (id: string | string[], notes: string) => void;
}

export const RequestManager: React.FC<RequestManagerProps> = ({ requests, onApprove, onReject }) => {
  const [activeFilter, setActiveFilter] = useState<"SEMUA" | "Diproses" | "Disetujui" | "Ditolak">("Diproses");
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  
  // Bulk rejection per student states
  const [bulkRejectStudentId, setBulkRejectStudentId] = useState<string | null>(null);
  const [bulkRejectReason, setBulkRejectReason] = useState("");

  // Multiple selection states
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkGlobalRejectOpen, setBulkGlobalRejectOpen] = useState(false);
  const [bulkGlobalRejectReason, setBulkGlobalRejectReason] = useState("");

  const filteredRequests = requests.filter((r) => {
    if (activeFilter === "SEMUA") return true;
    return r.status === activeFilter;
  });

  // Find all pending requests under current active context
  const allCurrentPendingRequests = filteredRequests.filter((r) => r.status === "Diproses");
  const allCurrentPendingIds = allCurrentPendingRequests.map((r) => r.id);
  const isAllCurrentPendingSelected = allCurrentPendingIds.length > 0 && allCurrentPendingIds.every((id) => selectedIds.includes(id));

  const handleToggleAllCurrentPending = () => {
    if (isAllCurrentPendingSelected) {
      setSelectedIds((prev) => prev.filter((id) => !allCurrentPendingIds.includes(id)));
    } else {
      setSelectedIds((prev) => Array.from(new Set([...prev, ...allCurrentPendingIds])));
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Group filtered requests by studentId
  const studentsWithRequests = (() => {
    const map: { [id: string]: {
      studentId: string;
      studentNisn: string;
      studentNama: string;
      latestRequestDate: string;
      items: CorrectionRequest[];
    }} = {};

    filteredRequests.forEach((req) => {
      const key = req.studentId;
      if (!map[key]) {
        map[key] = {
          studentId: req.studentId,
          studentNisn: req.studentNisn,
          studentNama: req.studentNama,
          latestRequestDate: req.requestDate,
          items: [],
        };
      }
      map[key].items.push(req);
      
      // Determine latest request timestamp
      if (req.requestDate > map[key].latestRequestDate) {
        map[key].latestRequestDate = req.requestDate;
      }
    });

    return Object.values(map);
  })();

  const handleOpenReject = (id: string) => {
    setRejectId(id);
    setRejectReason("");
    setBulkRejectStudentId(null);
  };

  const handleConfirmReject = (id: string) => {
    if (!rejectReason.trim()) return;
    onReject(id, rejectReason);
    setSelectedIds((prev) => prev.filter((item) => item !== id));
    setRejectId(null);
  };

  const handleOpenBulkReject = (studentId: string) => {
    setBulkRejectStudentId(studentId);
    setBulkRejectReason("");
    setRejectId(null);
  };

  const handleConfirmBulkReject = (studentId: string, pendingReqIds: string[]) => {
    if (!bulkRejectReason.trim()) return;
    onReject(pendingReqIds, bulkRejectReason);
    setSelectedIds((prev) => prev.filter((id) => !pendingReqIds.includes(id)));
    setBulkRejectStudentId(null);
  };

  const handleBulkApprove = (pendingReqIds: string[]) => {
    onApprove(pendingReqIds);
    setSelectedIds((prev) => prev.filter((id) => !pendingReqIds.includes(id)));
  };

  return (
    <div className="space-y-6">
      {/* Header with Filter controls */}
      <div className="bg-white border border-gray-150 p-5 rounded-2xl shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h3 className="font-sans font-bold text-slate-800 text-sm flex items-center gap-2">
            <Layers className="w-4 h-4 text-blue-600" />
            Verifikasi Pengajuan Perubahan Data Per Siswa
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Revisi biodata oleh siswa dikelompokkan per profil siswa. Anda dapat mengesahkan seluruh poin revisi sekaligus atau per bagian kolom data.
          </p>
        </div>

        {/* Filters */}
        <div className="flex bg-slate-150 p-1.5 rounded-xl gap-1 shrink-0 self-start lg:self-auto">
          {(["Diproses", "Disetujui", "Ditolak", "SEMUA"] as const).map((filter) => {
            const text = filter === "Diproses" ? "Menunggu Verifikasi" : filter === "SEMUA" ? "Semua" : filter;
            return (
              <button
                key={filter}
                type="button"
                onClick={() => {
                  setActiveFilter(filter);
                  setRejectId(null);
                  setBulkRejectStudentId(null);
                  setSelectedIds([]);
                  setBulkGlobalRejectOpen(false);
                }}
                className={`px-3.5 py-2 text-xs font-bold font-sans rounded-lg transition whitespace-nowrap ${
                  activeFilter === filter
                    ? "bg-white text-slate-800 shadow-sm"
                    : "text-gray-500 hover:text-gray-900"
                }`}
              >
                {text} ({filter === "SEMUA" ? requests.length : requests.filter(r => r.status === filter).length})
              </button>
            );
          })}
        </div>
      </div>

      {/* Global select toggler bar */}
      {allCurrentPendingRequests.length > 0 && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-slate-50 border border-gray-150 p-3.5 px-5 rounded-2xl text-xs text-slate-755 gap-3">
          <label className="flex items-center gap-2.5 cursor-pointer select-none font-bold text-slate-700">
            <input
              type="checkbox"
              checked={isAllCurrentPendingSelected}
              onChange={handleToggleAllCurrentPending}
              className="w-4.5 h-4.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer transition"
            />
            <span>{isAllCurrentPendingSelected ? "Sembunyikan semua pilihan" : "Pilih Semua Kolom Usulan Diproses"} ({allCurrentPendingRequests.length} baris)</span>
          </label>
          <span className="text-slate-500 font-bold bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
            {selectedIds.length} item terekam untuk aksi massal
          </span>
        </div>
      )}

      {/* Bulk Action Sticky/Floating Panel */}
      {selectedIds.length > 0 && (
        <div className="bg-blue-600 border border-blue-500 text-white p-5 rounded-3xl shadow-xl shadow-blue-600/10 flex flex-col md:flex-row md:items-center justify-between gap-4 animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-750/85 rounded-2xl relative shrink-0">
              <Check className="w-5 h-5 text-white" />
              <span className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow border-2 border-blue-600">
                {selectedIds.length}
              </span>
            </div>
            <div>
              <h4 className="font-sans font-black text-sm">
                Tindakan Massal untuk {selectedIds.length} Pengajuan Terpilih
              </h4>
              <p className="text-[11px] text-blue-105 font-medium mt-0.5 max-w-lg">
                Gunakan menu di kanan untuk langsung meluncurkan status disetujui atau penolakan kolektif pada data revisi terchecklist.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap justify-start md:justify-end">
            <button
              type="button"
              onClick={() => {
                onApprove(selectedIds);
                setSelectedIds([]);
              }}
              className="px-4 py-2.5 bg-white hover:bg-slate-50 text-blue-700 rounded-xl text-xs font-black font-sans flex items-center gap-1.5 transition shadow"
            >
              <CheckCircle className="w-4 h-4 text-blue-600" />
              Setujui Massal ({selectedIds.length})
            </button>

            {bulkGlobalRejectOpen ? (
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto p-2 bg-blue-750 border border-blue-500 rounded-2xl mt-1 sm:mt-0 transition">
                <input
                  type="text"
                  required
                  value={bulkGlobalRejectReason}
                  onChange={(e) => setBulkGlobalRejectReason(e.target.value)}
                  placeholder="Alasan penolakan bersama..."
                  className="p-1.5 px-3 bg-white border border-transparent rounded-xl text-xs text-slate-800 font-semibold focus:outline-none placeholder-slate-450 min-w-[200px]"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (!bulkGlobalRejectReason.trim()) return;
                    onReject(selectedIds, bulkGlobalRejectReason);
                    setSelectedIds([]);
                    setBulkGlobalRejectOpen(false);
                    setBulkGlobalRejectReason("");
                  }}
                  disabled={!bulkGlobalRejectReason.trim()}
                  className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold transition disabled:opacity-50"
                >
                  Tolak Massal
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setBulkGlobalRejectOpen(false);
                  }}
                  className="px-2 py-1.5 text-slate-200 hover:text-white rounded-lg text-xs font-semibold transition"
                >
                  Batal
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setBulkGlobalRejectOpen(true)}
                className="px-4 py-2.5 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-black font-sans flex items-center gap-1.5 transition border border-blue-550 shadow"
              >
                <XCircle className="w-4 h-4 text-blue-300" />
                Tolak Massal ({selectedIds.length})
              </button>
            )}

            <button
              type="button"
              onClick={() => setSelectedIds([])}
              className="px-3.5 py-2 hover:bg-blue-650 rounded-xl text-xs text-white font-bold font-sans transition"
            >
              Bersihkan Pilihan
            </button>
          </div>
        </div>
      )}

      {/* Grid List grouped by Students */}
      {studentsWithRequests.length > 0 ? (
        <div className="space-y-6">
          {studentsWithRequests.map((group) => {
            const pendingRequests = group.items.filter((r) => r.status === "Diproses");
            const pendingIds = pendingRequests.map((r) => r.id);
            const isAllGroupSelected = pendingIds.length > 0 && pendingIds.every(id => selectedIds.includes(id));

            return (
              <div 
                key={group.studentId}
                className="bg-white rounded-3xl border border-gray-150 p-6 shadow-sm space-y-5 hover:border-gray-300 transition"
              >
                {/* 1. Student Header Deck inside the card */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-5">
                  <div className="flex items-center gap-3.5">
                    {pendingRequests.length > 0 && (
                      <div className="shrink-0 flex items-center pr-1 select-none">
                        <input
                          type="checkbox"
                          checked={isAllGroupSelected}
                          onChange={() => {
                            if (isAllGroupSelected) {
                              setSelectedIds((prev) => prev.filter((id) => !pendingIds.includes(id)));
                            } else {
                              setSelectedIds((prev) => Array.from(new Set([...prev, ...pendingIds])));
                            }
                          }}
                          className="w-5 h-5 rounded-lg border-gray-305 text-blue-600 focus:ring-blue-550 cursor-pointer transition scale-110"
                          title="Pilih/Batal seluruh revisi kesiswaan untuk siswa ini"
                        />
                      </div>
                    )}
                    <div className="p-3 bg-blue-50 text-blue-700 rounded-2xl">
                      <User className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-sans font-black text-slate-800 text-sm leading-snug">
                        {group.studentNama}
                      </h4>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-[11px] font-mono font-semibold text-slate-500">
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-750 border border-slate-200/60 rounded">
                          NISN: {group.studentNisn}
                        </span>
                        <span>• Data Diperbarui: {group.latestRequestDate}</span>
                      </div>
                    </div>
                  </div>

                  {/* Bulk Actions at student card level */}
                  {pendingRequests.length > 0 && (
                    <div className="flex items-center gap-2 self-start md:self-center shrink-0">
                      <button
                        type="button"
                        onClick={() => handleBulkApprove(pendingIds)}
                        className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-blue-600/10 transition"
                      >
                        <Check className="w-4 h-4" />
                        Setujui Semua ({pendingRequests.length})
                      </button>
                      
                      <button
                        type="button"
                        onClick={() => handleOpenBulkReject(group.studentId)}
                        className="px-3.5 py-2 bg-white hover:bg-rose-50 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition"
                      >
                        <X className="w-4 h-4" />
                        Tolak Semua
                      </button>
                    </div>
                  )}
                </div>

                {/* Bulk rejection edit area */}
                {bulkRejectStudentId === group.studentId && (
                  <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl space-y-3 animate-fade-in">
                    <div className="flex items-start gap-2.5 text-xs font-bold text-rose-800">
                      <AlertCircle className="w-4 h-4 text-rose-600 mt-0.5" />
                      <div>
                        <span>Tolak Seluruh ({pendingRequests.length}) Pengajuan Siswa Ini</span>
                        <p className="text-[10px] text-rose-600 font-semibold font-sans mt-0.5">Seluruh kolom usulan di bawah akan ditolak dengan alasan penulisan administrasi yang sama.</p>
                      </div>
                    </div>
                    <textarea
                      rows={2}
                      required
                      value={bulkRejectReason}
                      onChange={(e) => setBulkRejectReason(e.target.value)}
                      placeholder="Alasan penolakan pengajuan gabungan. Contoh: Dokumen pendukung belum dilengkapi..."
                      className="w-full p-2.5 border border-rose-300 rounded-xl text-xs text-rose-950 font-semibold focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
                    />
                    <div className="flex gap-2 justify-end">
                      <button
                        type="button"
                        onClick={() => setBulkRejectStudentId(null)}
                        className="px-3 py-1.5 text-xs font-bold bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 rounded-lg transition"
                      >
                        Batal
                      </button>
                      <button
                        type="button"
                        onClick={() => handleConfirmBulkReject(group.studentId, pendingIds)}
                        disabled={!bulkRejectReason.trim()}
                        className="px-3.5 py-1.5 text-xs font-black bg-rose-650 hover:bg-rose-750 text-white rounded-lg transition shadow disabled:opacity-50"
                      >
                        Kirim Penolakan Semua
                      </button>
                    </div>
                  </div>
                )}

                {/* 2. List of Revised Fields for this Student */}
                <div className="space-y-3.5">
                  {group.items.map((req) => {
                    const isSelected = selectedIds.includes(req.id);
                    return (
                      <div 
                        key={req.id}
                        className={`border rounded-2xl p-4.5 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all duration-200 ${
                          isSelected
                            ? "bg-blue-50/20 border-blue-350 shadow-sm shadow-blue-50/40"
                            : "bg-slate-55/70 border-gray-150 hover:bg-slate-100/50"
                        }`}
                      >
                        {/* Selector checkbox or empty spacing for status constraints */}
                        <div className="flex items-center gap-3 flex-1">
                          {req.status === "Diproses" && (
                            <div className="shrink-0 flex items-center select-none">
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => handleToggleSelect(req.id)}
                                className="w-4.5 h-4.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer transition"
                              />
                            </div>
                          )}

                          {/* Left: Metadata about column update */}
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-sans font-bold text-xs text-slate-750 bg-white border border-gray-200 p-1 px-2 rounded-lg">
                                {req.fieldLabel}
                              </span>
                              <span className="text-[10px] text-gray-450 font-mono italic">
                                ({req.requestDate})
                              </span>
                            </div>

                            {/* Red vs Green value diff container */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl relative">
                              <div className="p-2.5 bg-rose-50/50 border border-rose-100 rounded-xl text-xs text-rose-900 leading-snug">
                                <span className="text-[9px] font-black tracking-wider text-rose-450 uppercase block mb-0.5">SEMULA (LAMA):</span>
                                <span className="font-mono font-medium break-all">{req.oldValue || <span className="italic text-rose-450">Kosong (-)</span>}</span>
                              </div>
                              
                              <div className="p-2.5 bg-blue-50/50 border border-blue-100 rounded-xl text-xs text-blue-900 leading-snug relative">
                                <span className="text-[9px] font-black tracking-wider text-blue-500 uppercase block mb-0.5 font-sans">REVISI (USULAN):</span>
                                <span className="font-mono font-bold break-all">{req.newValue}</span>
                                <span className="hidden sm:block absolute -left-4 top-1/2 -translate-y-1/2 bg-white border border-gray-200 p-0.5 rounded-full text-slate-400">
                                  <ArrowRight className="w-3 h-3" />
                                </span>
                              </div>
                            </div>

                            {/* Rejection Notes if set */}
                            {req.notes && (
                              <div className="p-2.5 bg-slate-100/80 border border-slate-205 rounded-xl text-[11px] text-slate-650 flex items-start gap-1.5 max-w-xl">
                                <MessageSquare className="w-3.5 h-3.5 mt-0.5 shrink-0 text-slate-500" />
                                <div>
                                  <strong className="text-slate-800">Catatan Staf:</strong> "{req.notes}"
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Right: Actions / Badges per specific item */}
                        <div className="shrink-0 flex items-center lg:justify-end gap-3 self-end md:self-center">
                          {req.status === "Diproses" ? (
                            <>
                              {rejectId === req.id ? (
                                <div className="flex flex-col sm:flex-row items-stretch gap-2 animate-fade-in w-full text-right">
                                  <input
                                    type="text"
                                    required
                                    value={rejectReason}
                                    onChange={(e) => setRejectReason(e.target.value)}
                                    placeholder="Alasan penolakan..."
                                    className="p-1.5 border border-rose-350 bg-white rounded-lg text-xs font-semibold focus:outline-none min-w-[180px]"
                                  />
                                  <div className="flex gap-1">
                                    <button
                                      type="button"
                                      onClick={() => handleConfirmReject(req.id)}
                                      disabled={!rejectReason.trim()}
                                      className="p-1 px-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded text-[11px] font-bold transition disabled:opacity-50"
                                    >
                                      Tolak
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => setRejectId(null)}
                                      className="p-1 px-2 bg-slate-200 text-slate-700 hover:bg-slate-300 rounded text-[11px] font-semibold transition"
                                    >
                                      Batal
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <div className="flex items-center gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() => handleBulkApprove([req.id])}
                                    className="p-1.5 px-3 bg-white hover:bg-slate-50 text-slate-750 border border-gray-200 rounded-lg text-xs font-bold transition inline-flex items-center gap-1.5"
                                    title="Setujui kolom revisi ini saja"
                                  >
                                    <Check className="w-3.5 h-3.5 text-blue-600" /> Setujui
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleOpenReject(req.id)}
                                    className="p-1.5 px-3 bg-white hover:bg-rose-50 text-rose-600 border border-rose-100 rounded-lg text-xs font-bold transition inline-flex items-center gap-1.5"
                                    title="Tolak kolom revisi ini saja"
                                  >
                                    <X className="w-3.5 h-3.5 text-rose-500" /> Tolak
                                  </button>
                                </div>
                              )}
                            </>
                          ) : (
                            <div>
                              {req.status === "Disetujui" ? (
                                <span className="px-2.5 py-1 text-[10px] font-bold rounded-full bg-blue-50 text-blue-700 border border-blue-150 flex items-center gap-1">
                                  <CheckCircle className="w-3 h-3 text-blue-600" />
                                  Disetujui
                                </span>
                              ) : (
                                <span className="px-2.5 py-1 text-[10px] font-bold rounded-full bg-rose-50 text-rose-700 border border-rose-150 flex items-center gap-1">
                                  <XCircle className="w-3 h-3 text-rose-600" />
                                  Ditolak
                                </span>
                              )}
                            </div>
                          )}
                        </div>

                      </div>
                    );
                  })}
                </div>

              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-gray-150 p-12 text-center shadow-inner">
          <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h4 className="font-sans font-bold text-slate-800 text-sm">Tidak Ada Pengajuan</h4>
          <p className="text-xs text-gray-500 max-w-md mx-auto mt-1 leading-relaxed">
            Saat ini tidak ada pengajuan revisi dengan status "{activeFilter === "SEMUA" ? "Semua Status" : activeFilter === "Diproses" ? "Menunggu Verifikasi" : activeFilter}" dalam sistem antrean data kesiswaan Buku Induk.
          </p>
        </div>
      )}
    </div>
  );
};
