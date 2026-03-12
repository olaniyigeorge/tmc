"use client";
import React, { useState, useEffect } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────
interface SubjectRow {
  name: string;
  scores: { test1: number | ""; test2: number | ""; exam: number | "" };
  total?: number;
  grade?: string;
  remark?: string;
  lastTermTotal?: number | null;
  cumulative?: number | null;
  average?: number | null;
}

interface AttendanceData {
  opened?: number | "";
  present?: number | "";
  punctual?: number | "";
  absent?: number | "";
}

interface CommentData {
  classTeacher?: string;
  headmaster?: string;
  principal?: string;
  parent?: string;
}

interface Props {
  initial: any;
  onSave: (data: any) => Promise<void>;
  onPublish: () => Promise<void>;
  readonly: boolean;
}

// ─── Default secondary subjects ───────────────────────────────────────────────
const DEFAULT_SUBJECTS = [
  "English Language",
  "Mathematics",
  "Basic Science",
  "Basic Technology",
  "Social Studies",
  "Civic Education",
  "Agricultural Science",
  "Business Studies",
  "Home Economics",
  "Physical Health Education",
  "Computer Studies",
  "Cultural & Creative Arts",
  "Christian Religious Studies",
  "History",
];

const GRADE_COLORS: Record<string, string> = {
  A1: "#16a34a", A: "#16a34a",
  B2: "#22c55e", B3: "#22c55e", B: "#22c55e",
  C4: "#84cc16", C5: "#84cc16", C6: "#84cc16", C: "#84cc16",
  D7: "#f59e0b", D: "#f59e0b",
  E8: "#f97316", E: "#f97316",
  F9: "#ef4444", F: "#ef4444",
};

function computeGrade(total: number): string {
  if (total >= 75) return "A1";
  if (total >= 70) return "B2";
  if (total >= 65) return "B3";
  if (total >= 60) return "C4";
  if (total >= 55) return "C5";
  if (total >= 50) return "C6";
  if (total >= 45) return "D7";
  if (total >= 40) return "E8";
  return "F9";
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function ResultFormSecondary({ initial, onSave, onPublish, readonly }: Props) {
  const [subjects, setSubjects] = useState<SubjectRow[]>([]);
  const [attendance, setAttendance] = useState<AttendanceData>({});
  const [comments, setComments] = useState<CommentData>({});
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [saved, setSaved] = useState(false);
  const [newSubjectName, setNewSubjectName] = useState("");
  const [showAddSubject, setShowAddSubject] = useState(false);
  const [publishModal, setPublishModal] = useState(false);
  const [publishResult, setPublishResult] = useState<{ pin: string; verificationCode: string } | null>(null);
  const [totalInClass, setTotalInClass] = useState<number | "">(initial?.totalInClass ?? "");

  // ─── Init from existing data ────────────────────────────────────────────────
  useEffect(() => {
    if (initial?.subjects?.length) {
      setSubjects(
        initial.subjects.map((s: any) => ({
          name: s.name,
          scores: {
            test1: s.scores?.test1 ?? "",
            test2: s.scores?.test2 ?? "",
            exam: s.scores?.exam ?? "",
          },
          total: s.total,
          grade: s.grade,
          remark: s.remark ?? "",
          lastTermTotal: s.lastTermTotal ?? null,
          cumulative: s.cumulative ?? null,
          average: s.average ?? null,
        }))
      );
    } else {
      // Pre-fill with default subjects
      setSubjects(
        DEFAULT_SUBJECTS.slice(0, 10).map((name) => ({
          name,
          scores: { test1: "", test2: "", exam: "" },
          remark: "",
        }))
      );
    }
    if (initial?.attendance) setAttendance(initial.attendance);
    if (initial?.comments) setComments(initial.comments);
  }, [initial]);

  // ─── Live total + grade computation ─────────────────────────────────────────
  const computeRow = (row: SubjectRow): SubjectRow => {
    const t1 = Number(row.scores.test1) || 0;
    const t2 = Number(row.scores.test2) || 0;
    const ex = Number(row.scores.exam) || 0;
    const total = t1 + t2 + ex;
    return { ...row, total, grade: computeGrade(total) };
  };

  const updateScore = (idx: number, col: "test1" | "test2" | "exam", val: string) => {
    setSubjects((prev) => {
      const next = [...prev];
      next[idx] = computeRow({ ...next[idx], scores: { ...next[idx].scores, [col]: val === "" ? "" : Number(val) } });
      return next;
    });
    setSaved(false);
  };

  const updateRemark = (idx: number, val: string) => {
    setSubjects((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], remark: val };
      return next;
    });
    setSaved(false);
  };

  const removeSubject = (idx: number) => {
    setSubjects((prev) => prev.filter((_, i) => i !== idx));
    setSaved(false);
  };

  const addSubject = () => {
    if (!newSubjectName.trim()) return;
    setSubjects((prev) => [
      ...prev,
      { name: newSubjectName.trim(), scores: { test1: "", test2: "", exam: "" }, remark: "" },
    ]);
    setNewSubjectName("");
    setShowAddSubject(false);
    setSaved(false);
  };

  const addFromDefault = (name: string) => {
    if (subjects.find((s) => s.name === name)) return;
    setSubjects((prev) => [
      ...prev,
      { name, scores: { test1: "", test2: "", exam: "" }, remark: "" },
    ]);
    setSaved(false);
  };

  // ─── Save ────────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave({
        subjects: subjects.map((s) => ({
          name: s.name,
          scores: {
            test1: s.scores.test1 === "" ? 0 : Number(s.scores.test1),
            test2: s.scores.test2 === "" ? 0 : Number(s.scores.test2),
            exam: s.scores.exam === "" ? 0 : Number(s.scores.exam),
          },
          remark: s.remark,
        })),
        attendance: {
          opened: attendance.opened === "" ? undefined : Number(attendance.opened),
          present: attendance.present === "" ? undefined : Number(attendance.present),
          punctual: attendance.punctual === "" ? undefined : Number(attendance.punctual),
          absent: attendance.absent === "" ? undefined : Number(attendance.absent),
        },
        comments,
        totalInClass: totalInClass === "" ? undefined : Number(totalInClass),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } finally {
      setSaving(false);
    }
  };

  // ─── Publish ─────────────────────────────────────────────────────────────────
  const handlePublish = async () => {
    setPublishing(true);
    try {
      // We intercept onPublish to capture the return value by patching
      const res = await fetch(`/api/admin/results/${initial._id}/publish`, { method: "POST" });
      const json = await res.json();
      if (json.ok) {
        setPublishResult({ pin: json.data.pin, verificationCode: json.data.verificationCode });
      } else {
        alert(json.error || "Publish failed");
      }
    } finally {
      setPublishing(false);
      setPublishModal(false);
    }
  };

  const grandTotal = subjects.reduce((sum, s) => sum + (s.total ?? 0), 0);
  const maxTotal = subjects.length * 100;
  const overallAvg = subjects.length ? (grandTotal / subjects.length).toFixed(1) : "—";

  // ─── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="rf-wrap">
      {/* Result metadata banner */}
      <div className="rf-meta-bar">
        <div className="rf-meta-item">
          <span className="rf-meta-label">Student</span>
          <span className="rf-meta-val">
            {initial?.studentId?.lastName} {initial?.studentId?.firstName}
            <span className="rf-meta-code">{initial?.studentId?.studentCode}</span>
          </span>
        </div>
        <div className="rf-meta-item">
          <span className="rf-meta-label">Class</span>
          <span className="rf-meta-val">{initial?.classSnapshot?.name}</span>
        </div>
        <div className="rf-meta-item">
          <span className="rf-meta-label">Session</span>
          <span className="rf-meta-val">{initial?.session}</span>
        </div>
        <div className="rf-meta-item">
          <span className="rf-meta-label">Term</span>
          <span className="rf-meta-val">{initial?.term} Term</span>
        </div>
        <div className="rf-meta-item">
          <span className="rf-meta-label">Status</span>
          <span className={`rf-status-pill ${initial?.status === "PUBLISHED" ? "published" : "draft"}`}>
            {initial?.status === "PUBLISHED" ? "✅ Published" : "✏️ Draft"}
          </span>
        </div>
      </div>

      {readonly && (
        <div className="rf-readonly-banner">
          🔒 This result has been published and is read-only.
        </div>
      )}

      {/* ── Attendance ── */}
      <section className="rf-section">
        <div className="rf-section-header">
          <h2 className="rf-section-title">
            <span className="rf-section-icon">📅</span> Attendance
          </h2>
        </div>
        <div className="rf-attendance-grid">
          {(["opened", "present", "punctual", "absent"] as const).map((key) => (
            <div key={key} className="rf-att-field">
              <label className="rf-att-label">{key.charAt(0).toUpperCase() + key.slice(1)}</label>
              <input
                type="number"
                min={0}
                className="rf-att-input"
                value={attendance[key] ?? ""}
                disabled={readonly}
                onChange={(e) => {
                  setAttendance((a) => ({ ...a, [key]: e.target.value === "" ? "" : Number(e.target.value) }));
                  setSaved(false);
                }}
                placeholder="—"
              />
            </div>
          ))}
          <div className="rf-att-field">
            <label className="rf-att-label">Total in Class</label>
            <input
              type="number"
              min={0}
              className="rf-att-input"
              value={totalInClass}
              disabled={readonly}
              onChange={(e) => {
                setTotalInClass(e.target.value === "" ? "" : Number(e.target.value));
                setSaved(false);
              }}
              placeholder="—"
            />
          </div>
        </div>
      </section>

      {/* ── Subjects Table ── */}
      <section className="rf-section">
        <div className="rf-section-header">
          <h2 className="rf-section-title">
            <span className="rf-section-icon">📚</span> Subject Scores
            <span className="rf-subject-count">{subjects.length} subjects</span>
          </h2>
          {!readonly && (
            <button className="rf-add-btn" onClick={() => setShowAddSubject(!showAddSubject)}>
              + Add Subject
            </button>
          )}
        </div>

        {/* Quick-add from default list */}
        {showAddSubject && !readonly && (
          <div className="rf-add-subject-panel">
            <div className="rf-add-subject-quick">
              <p className="rf-add-subtitle">Quick add from list:</p>
              <div className="rf-quick-tags">
                {DEFAULT_SUBJECTS.filter((n) => !subjects.find((s) => s.name === n)).map((name) => (
                  <button key={name} className="rf-quick-tag" onClick={() => addFromDefault(name)}>
                    + {name}
                  </button>
                ))}
              </div>
            </div>
            <div className="rf-add-subject-custom">
              <p className="rf-add-subtitle">Or add custom:</p>
              <div className="rf-add-row">
                <input
                  className="rf-add-input"
                  value={newSubjectName}
                  onChange={(e) => setNewSubjectName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addSubject()}
                  placeholder="Subject name…"
                />
                <button className="rf-add-confirm-btn" onClick={addSubject}>Add</button>
                <button className="rf-add-cancel-btn" onClick={() => setShowAddSubject(false)}>Cancel</button>
              </div>
            </div>
          </div>
        )}

        <div className="rf-table-scroll">
          <table className="rf-table">
            <thead>
              <tr>
                <th className="rf-th rf-th-subject">Subject</th>
                <th className="rf-th rf-th-score">
                  Test 1
                  <span className="rf-th-max">/20</span>
                </th>
                <th className="rf-th rf-th-score">
                  Test 2
                  <span className="rf-th-max">/20</span>
                </th>
                <th className="rf-th rf-th-score">
                  Exam
                  <span className="rf-th-max">/60</span>
                </th>
                <th className="rf-th rf-th-total">Total</th>
                <th className="rf-th rf-th-grade">Grade</th>
                <th className="rf-th rf-th-remark">Remark</th>
                {!readonly && <th className="rf-th rf-th-action"></th>}
              </tr>
            </thead>
            <tbody>
              {subjects.map((subj, idx) => {
                const total = subj.total ?? 0;
                const grade = subj.grade ?? computeGrade(total);
                const gradeColor = GRADE_COLORS[grade] ?? "#6b7280";
                return (
                  <tr key={idx} className="rf-tr">
                    <td className="rf-td rf-td-subject">{subj.name}</td>
                    {(["test1", "test2", "exam"] as const).map((col) => {
                      const maxVal = col === "exam" ? 60 : 20;
                      const val = subj.scores[col];
                      const numVal = Number(val);
                      const isOver = val !== "" && numVal > maxVal;
                      return (
                        <td key={col} className="rf-td rf-td-score">
                          {readonly ? (
                            <span className="rf-score-readonly">{val === "" ? "—" : val}</span>
                          ) : (
                            <input
                              type="number"
                              min={0}
                              max={maxVal}
                              className={`rf-score-input ${isOver ? "rf-score-over" : ""}`}
                              value={val}
                              onChange={(e) => updateScore(idx, col, e.target.value)}
                              placeholder="—"
                            />
                          )}
                        </td>
                      );
                    })}
                    <td className="rf-td rf-td-total">
                      <span className="rf-total-val">{total}</span>
                      <div className="rf-total-bar">
                        <div
                          className="rf-total-fill"
                          style={{ width: `${total}%`, backgroundColor: gradeColor }}
                        />
                      </div>
                    </td>
                    <td className="rf-td rf-td-grade">
                      <span className="rf-grade-badge" style={{ color: gradeColor, borderColor: gradeColor + "40", backgroundColor: gradeColor + "10" }}>
                        {grade}
                      </span>
                    </td>
                    <td className="rf-td rf-td-remark">
                      {readonly ? (
                        <span className="rf-remark-text">{subj.remark || "—"}</span>
                      ) : (
                        <input
                          className="rf-remark-input"
                          value={subj.remark ?? ""}
                          onChange={(e) => updateRemark(idx, e.target.value)}
                          placeholder="Optional…"
                        />
                      )}
                    </td>
                    {!readonly && (
                      <td className="rf-td rf-td-action">
                        <button className="rf-remove-btn" onClick={() => removeSubject(idx)} title="Remove">
                          ✕
                        </button>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="rf-tfoot-row">
                <td className="rf-td rf-tfoot-label" colSpan={4}>Summary</td>
                <td className="rf-td rf-tfoot-total">{grandTotal}</td>
                <td className="rf-td rf-tfoot-avg" colSpan={readonly ? 2 : 3}>
                  Avg: <strong>{overallAvg}</strong> / 100
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </section>

      {/* ── Comments ── */}
      <section className="rf-section">
        <div className="rf-section-header">
          <h2 className="rf-section-title">
            <span className="rf-section-icon">💬</span> Comments
          </h2>
        </div>
        <div className="rf-comments-grid">
          {(["classTeacher", "headmaster", "principal"] as const).map((key) => {
            const labels: Record<string, string> = {
              classTeacher: "Class Teacher",
              headmaster: "Headmaster / Principal",
              principal: "Principal",
            };
            return (
              <div key={key} className="rf-comment-field">
                <label className="rf-comment-label">{labels[key]}</label>
                {readonly ? (
                  <p className="rf-comment-readonly">{comments[key] || "—"}</p>
                ) : (
                  <textarea
                    className="rf-comment-textarea"
                    rows={2}
                    value={comments[key] ?? ""}
                    onChange={(e) => {
                      setComments((c) => ({ ...c, [key]: e.target.value }));
                      setSaved(false);
                    }}
                    placeholder={`${labels[key]}'s comment…`}
                  />
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Action Bar ── */}
      {!readonly && (
        <div className="rf-action-bar">
          <div className="rf-save-status">
            {saved && <span className="rf-saved-msg">✅ Saved successfully</span>}
          </div>
          <div className="rf-action-btns">
            <button className="rf-btn rf-btn-save" onClick={handleSave} disabled={saving}>
              {saving ? (
                <><span className="rf-spinner" /> Saving…</>
              ) : (
                "💾 Save Draft"
              )}
            </button>
            <button className="rf-btn rf-btn-publish" onClick={() => setPublishModal(true)}>
              🚀 Publish Result
            </button>
          </div>
        </div>
      )}

      {/* ── Publish Modal ── */}
      {publishModal && (
        <div className="rf-modal-overlay" onClick={() => setPublishModal(false)}>
          <div className="rf-modal" onClick={(e) => e.stopPropagation()}>
            <div className="rf-modal-icon">🚀</div>
            <h3 className="rf-modal-title">Publish Result</h3>
            <p className="rf-modal-desc">
              This will publish the result and generate a <strong>PIN</strong> for the student/parent to access it.
              The PIN will be shown <strong>only once</strong> — make sure to copy and share it immediately.
            </p>
            <div className="rf-modal-actions">
              <button className="rf-btn rf-btn-cancel" onClick={() => setPublishModal(false)}>
                Cancel
              </button>
              <button className="rf-btn rf-btn-publish" onClick={handlePublish} disabled={publishing}>
                {publishing ? "Publishing…" : "✅ Confirm & Publish"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Publish Success Modal ── */}
      {publishResult && (
        <div className="rf-modal-overlay">
          <div className="rf-modal rf-modal-success">
            <div className="rf-modal-icon">🎉</div>
            <h3 className="rf-modal-title">Result Published!</h3>
            <p className="rf-modal-desc">Share these credentials with the student/parent. The PIN cannot be recovered.</p>

            <div className="rf-pin-box">
              <div className="rf-pin-row">
                <span className="rf-pin-label">PIN</span>
                <span className="rf-pin-value">{publishResult.pin}</span>
                <button
                  className="rf-copy-btn"
                  onClick={() => navigator.clipboard.writeText(publishResult.pin)}
                >
                  Copy
                </button>
              </div>
              <div className="rf-pin-row">
                <span className="rf-pin-label">Verification Code</span>
                <span className="rf-pin-value rf-pin-code">{publishResult.verificationCode}</span>
                <button
                  className="rf-copy-btn"
                  onClick={() => navigator.clipboard.writeText(publishResult.verificationCode)}
                >
                  Copy
                </button>
              </div>
            </div>

            <button
              className="rf-btn rf-btn-publish"
              style={{ marginTop: 20, width: "100%" }}
              onClick={() => {
                setPublishResult(null);
                window.location.reload();
              }}
            >
              Done
            </button>
          </div>
        </div>
      )}

      <style>{styles}</style>
    </div>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = `
.rf-wrap {
  max-width: 1100px;
  margin: 0 auto;
  padding-bottom: 80px;
  font-family: 'DM Sans', 'Segoe UI', sans-serif;
}

/* Meta bar */
.rf-meta-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 0;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 24px;
}
.rf-meta-item {
  flex: 1;
  min-width: 140px;
  padding: 14px 20px;
  border-right: 1px solid #e2e8f0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.rf-meta-item:last-child { border-right: none; }
.rf-meta-label {
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: .08em;
  color: #94a3b8;
}
.rf-meta-val {
  font-size: 13px;
  font-weight: 600;
  color: #1e293b;
  display: flex;
  align-items: center;
  gap: 6px;
}
.rf-meta-code {
  font-size: 11px;
  background: #e2e8f0;
  border-radius: 4px;
  padding: 1px 5px;
  color: #64748b;
  font-family: monospace;
}
.rf-status-pill {
  font-size: 11px;
  font-weight: 600;
  border-radius: 20px;
  padding: 3px 10px;
}
.rf-status-pill.published { background: #dcfce7; color: #16a34a; }
.rf-status-pill.draft { background: #fef9c3; color: #92400e; }

.rf-readonly-banner {
  background: #fffbeb;
  border: 1px solid #fde68a;
  color: #92400e;
  border-radius: 8px;
  padding: 10px 16px;
  font-size: 13px;
  margin-bottom: 20px;
}

/* Section */
.rf-section {
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  overflow: hidden;
  margin-bottom: 20px;
}
.rf-section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid #f1f5f9;
  background: #f8fafc;
}
.rf-section-title {
  font-size: 14px;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
}
.rf-section-icon { font-size: 16px; }
.rf-subject-count {
  font-size: 11px;
  background: #e2e8f0;
  color: #64748b;
  border-radius: 10px;
  padding: 2px 8px;
  font-weight: 500;
}

/* Add subject */
.rf-add-btn {
  background: #1e293b;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 7px 14px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: background .15s;
}
.rf-add-btn:hover { background: #0f172a; }

.rf-add-subject-panel {
  padding: 16px 20px;
  border-bottom: 1px solid #f1f5f9;
  background: #f8fafc;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.rf-add-subtitle {
  font-size: 11px;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: .06em;
  margin: 0 0 6px;
}
.rf-quick-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.rf-quick-tag {
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 20px;
  padding: 4px 12px;
  font-size: 12px;
  color: #475569;
  cursor: pointer;
  transition: all .15s;
}
.rf-quick-tag:hover { background: #1e293b; color: #fff; border-color: #1e293b; }
.rf-add-row { display: flex; gap: 8px; align-items: center; }
.rf-add-input {
  flex: 1;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 8px 12px;
  font-size: 13px;
  outline: none;
}
.rf-add-input:focus { border-color: #6366f1; box-shadow: 0 0 0 3px #6366f120; }
.rf-add-confirm-btn {
  background: #6366f1;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 8px 16px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
}
.rf-add-cancel-btn {
  background: transparent;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 8px 12px;
  font-size: 13px;
  cursor: pointer;
  color: #64748b;
}

/* Table */
.rf-table-scroll { overflow-x: auto; }
.rf-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}
.rf-th {
  padding: 10px 12px;
  text-align: left;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: .06em;
  color: #64748b;
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
  white-space: nowrap;
}
.rf-th-score, .rf-th-total, .rf-th-grade { text-align: center; }
.rf-th-max {
  display: block;
  font-size: 9px;
  font-weight: 400;
  color: #94a3b8;
  letter-spacing: 0;
}
.rf-tr:hover { background: #f8fafc; }
.rf-tr:nth-child(even) { background: #fafafa; }
.rf-tr:nth-child(even):hover { background: #f1f5f9; }
.rf-td {
  padding: 9px 12px;
  border-bottom: 1px solid #f1f5f9;
  color: #334155;
}
.rf-td-subject { font-weight: 600; color: #1e293b; }
.rf-td-score, .rf-td-total, .rf-td-grade { text-align: center; }
.rf-td-action { text-align: center; }

.rf-score-input {
  width: 58px;
  text-align: center;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  padding: 5px 4px;
  font-size: 13px;
  font-weight: 600;
  color: #1e293b;
  outline: none;
  transition: border .15s, box-shadow .15s;
}
.rf-score-input:focus { border-color: #6366f1; box-shadow: 0 0 0 3px #6366f115; }
.rf-score-input.rf-score-over { border-color: #ef4444; background: #fef2f2; }
.rf-score-readonly { font-weight: 600; color: #475569; }

.rf-total-val { display: block; font-weight: 700; font-size: 14px; color: #1e293b; }
.rf-total-bar { height: 3px; background: #f1f5f9; border-radius: 2px; margin-top: 3px; min-width: 48px; }
.rf-total-fill { height: 100%; border-radius: 2px; transition: width .3s; }

.rf-grade-badge {
  display: inline-block;
  font-size: 12px;
  font-weight: 700;
  border: 1px solid;
  border-radius: 6px;
  padding: 2px 10px;
  letter-spacing: .04em;
}

.rf-remark-input {
  width: 100%;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  padding: 5px 8px;
  font-size: 12px;
  color: #475569;
  outline: none;
  min-width: 120px;
}
.rf-remark-input:focus { border-color: #6366f1; }
.rf-remark-text { font-size: 12px; color: #64748b; }

.rf-remove-btn {
  background: transparent;
  border: 1px solid #fee2e2;
  border-radius: 6px;
  padding: 3px 8px;
  font-size: 11px;
  color: #ef4444;
  cursor: pointer;
  transition: all .15s;
}
.rf-remove-btn:hover { background: #fef2f2; }

/* Tfoot */
.rf-tfoot-row { background: #f8fafc; }
.rf-tfoot-label {
  font-weight: 700;
  font-size: 12px;
  color: #475569;
  text-transform: uppercase;
  letter-spacing: .05em;
}
.rf-tfoot-total {
  text-align: center;
  font-weight: 800;
  font-size: 16px;
  color: #1e293b;
}
.rf-tfoot-avg {
  font-size: 12px;
  color: #475569;
  text-align: right;
  padding-right: 20px;
}

/* Attendance */
.rf-attendance-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  padding: 20px;
}
.rf-att-field { display: flex; flex-direction: column; gap: 6px; }
.rf-att-label {
  font-size: 11px;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: .06em;
}
.rf-att-input {
  width: 90px;
  text-align: center;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 8px 10px;
  font-size: 15px;
  font-weight: 700;
  color: #1e293b;
  outline: none;
}
.rf-att-input:focus { border-color: #6366f1; box-shadow: 0 0 0 3px #6366f115; }
.rf-att-input:disabled { background: #f8fafc; color: #94a3b8; }

/* Comments */
.rf-comments-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
  padding: 20px;
}
.rf-comment-field { display: flex; flex-direction: column; gap: 6px; }
.rf-comment-label {
  font-size: 11px;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: .06em;
}
.rf-comment-textarea {
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 10px 12px;
  font-size: 13px;
  color: #334155;
  resize: vertical;
  outline: none;
  font-family: inherit;
  line-height: 1.5;
}
.rf-comment-textarea:focus { border-color: #6366f1; box-shadow: 0 0 0 3px #6366f115; }
.rf-comment-readonly { font-size: 13px; color: #475569; background: #f8fafc; border-radius: 8px; padding: 10px 12px; min-height: 48px; border: 1px solid #f1f5f9; }

/* Action bar */
.rf-action-bar {
  position: sticky;
  bottom: 0;
  background: rgba(255,255,255,.95);
  backdrop-filter: blur(12px);
  border-top: 1px solid #e2e8f0;
  padding: 14px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-radius: 0 0 14px 14px;
  z-index: 40;
  margin-top: 20px;
  box-shadow: 0 -4px 20px rgba(0,0,0,.06);
}
.rf-save-status { min-height: 24px; }
.rf-saved-msg { font-size: 13px; color: #16a34a; font-weight: 500; }
.rf-action-btns { display: flex; gap: 10px; }
.rf-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  border: none;
  border-radius: 9px;
  padding: 10px 20px;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition: all .15s;
  letter-spacing: .01em;
}
.rf-btn:disabled { opacity: .6; cursor: not-allowed; }
.rf-btn-save { background: #f1f5f9; color: #1e293b; }
.rf-btn-save:hover:not(:disabled) { background: #e2e8f0; }
.rf-btn-publish { background: #1e293b; color: #fff; }
.rf-btn-publish:hover:not(:disabled) { background: #0f172a; }
.rf-btn-cancel { background: #f1f5f9; color: #64748b; }

/* Spinner */
.rf-spinner {
  width: 12px; height: 12px;
  border: 2px solid #94a3b8;
  border-top-color: #1e293b;
  border-radius: 50%;
  animation: rf-spin .6s linear infinite;
  display: inline-block;
}
@keyframes rf-spin { to { transform: rotate(360deg); } }

/* Modal */
.rf-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15,23,42,.55);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 200;
  animation: rf-fade-in .2s;
}
@keyframes rf-fade-in { from { opacity: 0 } to { opacity: 1 } }
.rf-modal {
  background: #fff;
  border-radius: 20px;
  padding: 32px 28px;
  width: 100%;
  max-width: 420px;
  box-shadow: 0 25px 60px rgba(0,0,0,.2);
  text-align: center;
  animation: rf-slide-up .25s;
}
@keyframes rf-slide-up { from { transform: translateY(20px); opacity: 0 } to { transform: translateY(0); opacity: 1 } }
.rf-modal-icon { font-size: 40px; margin-bottom: 10px; }
.rf-modal-title { font-size: 18px; font-weight: 800; color: #0f172a; margin: 0 0 8px; }
.rf-modal-desc { font-size: 13px; color: #475569; line-height: 1.6; margin-bottom: 24px; }
.rf-modal-actions { display: flex; gap: 10px; justify-content: center; }

/* PIN box */
.rf-pin-box {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  overflow: hidden;
}
.rf-pin-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 16px;
  border-bottom: 1px solid #f1f5f9;
}
.rf-pin-row:last-child { border-bottom: none; }
.rf-pin-label { font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; min-width: 100px; text-align: left; }
.rf-pin-value { font-family: monospace; font-size: 15px; font-weight: 700; color: #1e293b; flex: 1; text-align: left; letter-spacing: .08em; }
.rf-pin-code { font-size: 12px; letter-spacing: .06em; }
.rf-copy-btn {
  background: #1e293b;
  color: #fff;
  border: none;
  border-radius: 6px;
  padding: 4px 10px;
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
}
`;