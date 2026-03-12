import React from "react";

interface SubjectRow {
  name: string;
  scores: Record<string, number>;
  total: number;
  grade: string;
  remark?: string;
  lastTermTotal?: number | null;
  cumulative?: number | null;
  average?: number | null;
}

interface ResultData {
  _id: string;
  schoolName?: string;
  schoolAddress?: string;
  studentId?: { firstName: string; lastName: string; otherName?: string; admissionNo?: string; sex?: string; dob?: string; studentCode: string };
  studentName?: string;
  classSnapshot: { name: string; level: string };
  session: string;
  term: string;
  subjects: SubjectRow[];
  attendance?: { opened?: number; present?: number; punctual?: number; absent?: number };
  totalInClass?: number;
  comments?: { classTeacher?: string; headmaster?: string; principal?: string; parent?: string };
  verificationCode: string;
  publishedAt?: string;
}

interface Props {
  result: ResultData;
}

const GRADE_COLORS: Record<string, { bg: string; text: string }> = {
  A1: { bg: "#dcfce7", text: "#15803d" },
  B2: { bg: "#d1fae5", text: "#047857" },
  B3: { bg: "#d1fae5", text: "#047857" },
  C4: { bg: "#ecfccb", text: "#3f6212" },
  C5: { bg: "#ecfccb", text: "#3f6212" },
  C6: { bg: "#ecfccb", text: "#3f6212" },
  D7: { bg: "#fef9c3", text: "#854d0e" },
  E8: { bg: "#ffedd5", text: "#9a3412" },
  F9: { bg: "#fee2e2", text: "#991b1b" },
};

function gradeColor(grade: string) {
  return GRADE_COLORS[grade] ?? { bg: "#f1f5f9", text: "#475569" };
}

function fullName(student: ResultData["studentId"]) {
  if (!student) return "—";
  return [student.lastName, student.firstName, student.otherName].filter(Boolean).join(" ");
}

export default function ResultSheetSecondary({ result }: Props) {
  const r = result as any;
  const student = r.studentId;
  const name = student ? fullName(student) : r.studentName ?? "—";
  const totalSubjects = r.subjects?.length ?? 0;
  const grandTotal = r.subjects?.reduce((s: number, sub: SubjectRow) => s + (sub.total ?? 0), 0) ?? 0;
  const avg = totalSubjects ? (grandTotal / totalSubjects).toFixed(1) : "—";

  return (
    <div className="rs-page">
      {/* ── Print button (hidden in print) ── */}
      <div className="rs-print-bar no-print">
        <div className="rs-print-info">
          <span className="rs-print-icon">📄</span>
          Result for <strong>{name}</strong> — {r.term} Term {r.session}
        </div>
        <button className="rs-print-btn" onClick={() => window.print()}>
          🖨️ Print / Save PDF
        </button>
      </div>

      {/* ═══════════════════════════════════════════════════════ */}
      {/*                   PRINTABLE SHEET                       */}
      {/* ═══════════════════════════════════════════════════════ */}
      <div className="rs-sheet">

        {/* ── School Header ── */}
        <div className="rs-school-header">
          <div className="rs-school-logo-placeholder">🏫</div>
          <div className="rs-school-text">
            <h1 className="rs-school-name">{r.schoolName ?? "Tinabel Model College"}</h1>
            {r.schoolAddress && <p className="rs-school-address">{r.schoolAddress}</p>}
            <h2 className="rs-sheet-title">Student Academic Report</h2>
          </div>
        </div>

        <div className="rs-divider" />

        {/* ── Student Info Grid ── */}
        <div className="rs-info-grid">
          <div className="rs-info-row">
            <div className="rs-info-cell">
              <span className="rs-info-label">Student Name</span>
              <span className="rs-info-val rs-info-val-large">{name}</span>
            </div>
            <div className="rs-info-cell">
              <span className="rs-info-label">Student Code</span>
              <span className="rs-info-val">{student?.studentCode ?? "—"}</span>
            </div>
            <div className="rs-info-cell">
              <span className="rs-info-label">Admission No.</span>
              <span className="rs-info-val">{student?.admissionNo ?? "—"}</span>
            </div>
          </div>
          <div className="rs-info-row">
            <div className="rs-info-cell">
              <span className="rs-info-label">Class</span>
              <span className="rs-info-val">{r.classSnapshot?.name ?? "—"}</span>
            </div>
            <div className="rs-info-cell">
              <span className="rs-info-label">Session</span>
              <span className="rs-info-val">{r.session}</span>
            </div>
            <div className="rs-info-cell">
              <span className="rs-info-label">Term</span>
              <span className="rs-info-val">{r.term} Term</span>
            </div>
            <div className="rs-info-cell">
              <span className="rs-info-label">Sex</span>
              <span className="rs-info-val">{student?.sex === "M" ? "Male" : student?.sex === "F" ? "Female" : "—"}</span>
            </div>
          </div>
        </div>

        {/* ── Attendance ── */}
        {r.attendance && (
          <div className="rs-attendance-row">
            <div className="rs-att-block">
              <span className="rs-att-label">Days School Opened</span>
              <span className="rs-att-val">{r.attendance.opened ?? "—"}</span>
            </div>
            <div className="rs-att-block">
              <span className="rs-att-label">Days Present</span>
              <span className="rs-att-val">{r.attendance.present ?? "—"}</span>
            </div>
            <div className="rs-att-block">
              <span className="rs-att-label">Times Punctual</span>
              <span className="rs-att-val">{r.attendance.punctual ?? "—"}</span>
            </div>
            <div className="rs-att-block">
              <span className="rs-att-label">Times Absent</span>
              <span className="rs-att-val">{r.attendance.absent ?? "—"}</span>
            </div>
            {r.totalInClass && (
              <div className="rs-att-block">
                <span className="rs-att-label">No. in Class</span>
                <span className="rs-att-val">{r.totalInClass}</span>
              </div>
            )}
          </div>
        )}

        {/* ── Subjects Table ── */}
        <table className="rs-table">
          <thead>
            <tr>
              <th className="rs-th rs-th-subject">Subject</th>
              <th className="rs-th rs-th-score">1st C.A<br /><small>/20</small></th>
              <th className="rs-th rs-th-score">2nd C.A<br /><small>/20</small></th>
              <th className="rs-th rs-th-score">Exam<br /><small>/60</small></th>
              <th className="rs-th rs-th-total">Total<br /><small>/100</small></th>
              <th className="rs-th rs-th-grade">Grade</th>
              <th className="rs-th rs-th-remark">Remark</th>
            </tr>
          </thead>
          <tbody>
            {(r.subjects ?? []).map((subj: SubjectRow, idx: number) => {
              const gc = gradeColor(subj.grade);
              return (
                <tr key={idx} className={idx % 2 === 0 ? "rs-tr-even" : "rs-tr-odd"}>
                  <td className="rs-td rs-td-subject">{subj.name}</td>
                  <td className="rs-td rs-td-score">{subj.scores?.test1 ?? 0}</td>
                  <td className="rs-td rs-td-score">{subj.scores?.test2 ?? 0}</td>
                  <td className="rs-td rs-td-score">{subj.scores?.exam ?? 0}</td>
                  <td className="rs-td rs-td-total">{subj.total}</td>
                  <td className="rs-td rs-td-grade">
                    <span className="rs-grade" style={{ background: gc.bg, color: gc.text }}>
                      {subj.grade}
                    </span>
                  </td>
                  <td className="rs-td rs-td-remark">{subj.remark || "—"}</td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr className="rs-tfoot">
              <td className="rs-td" colSpan={3}><strong>Summary</strong></td>
              <td className="rs-td rs-td-score" style={{ fontWeight: 700 }}>{grandTotal}</td>
              <td className="rs-td rs-td-total" style={{ fontWeight: 800, fontSize: 15 }}>—</td>
              <td className="rs-td" colSpan={2}>
                Average: <strong>{avg}</strong> &nbsp;|&nbsp; Subjects: <strong>{totalSubjects}</strong>
              </td>
            </tr>
          </tfoot>
        </table>

        {/* ── Grading Key ── */}
        <div className="rs-grading-key">
          <span className="rs-key-title">Grading Key:</span>
          {[
            ["A1", "75–100", "#15803d"],
            ["B2", "70–74", "#047857"],
            ["B3", "65–69", "#047857"],
            ["C4", "60–64", "#3f6212"],
            ["C5", "55–59", "#3f6212"],
            ["C6", "50–54", "#3f6212"],
            ["D7", "45–49", "#854d0e"],
            ["E8", "40–44", "#9a3412"],
            ["F9", "0–39", "#991b1b"],
          ].map(([g, r, c]) => (
            <span key={g} className="rs-key-item" style={{ color: c as string }}>
              <strong>{g}</strong>: {r}
            </span>
          ))}
        </div>

        {/* ── Comments ── */}
        {(r.comments?.classTeacher || r.comments?.headmaster || r.comments?.principal) && (
          <div className="rs-comments">
            {r.comments?.classTeacher && (
              <div className="rs-comment-block">
                <div className="rs-comment-label">Class Teacher's Comment</div>
                <div className="rs-comment-text">{r.comments.classTeacher}</div>
                <div className="rs-comment-sig">Signature: ___________________</div>
              </div>
            )}
            {(r.comments?.headmaster || r.comments?.principal) && (
              <div className="rs-comment-block">
                <div className="rs-comment-label">Principal's Comment</div>
                <div className="rs-comment-text">{r.comments.headmaster || r.comments.principal}</div>
                <div className="rs-comment-sig">Signature: ___________________</div>
              </div>
            )}
          </div>
        )}

        {/* ── Footer ── */}
        <div className="rs-footer">
          <div className="rs-footer-left">
            <div className="rs-verify-code">
              <span className="rs-verify-label">Verification Code:</span>
              <code className="rs-verify-val">{r.verificationCode}</code>
            </div>
            <div className="rs-verify-url">
              Verify at: <strong>{typeof window !== "undefined" ? window.location.origin : ""}/verify/{r.verificationCode}</strong>
            </div>
          </div>
          <div className="rs-footer-right">
            {r.publishedAt && (
              <div className="rs-issued">
                Issued: {new Date(r.publishedAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
              </div>
            )}
            <div className="rs-school-stamp">School Stamp</div>
          </div>
        </div>
      </div>

      <style>{styles}</style>
    </div>
  );
}

const styles = `
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');

.rs-page {
  font-family: 'DM Sans', 'Segoe UI', sans-serif;
  max-width: 860px;
  margin: 0 auto;
  padding: 24px 16px 60px;
}

/* Print bar */
.rs-print-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #1e293b;
  border-radius: 12px;
  padding: 14px 20px;
  margin-bottom: 24px;
  color: #fff;
  gap: 16px;
  flex-wrap: wrap;
}
.rs-print-info {
  font-size: 14px;
  color: #94a3b8;
  display: flex;
  align-items: center;
  gap: 8px;
}
.rs-print-info strong { color: #fff; }
.rs-print-icon { font-size: 18px; }
.rs-print-btn {
  background: #fff;
  color: #1e293b;
  border: none;
  border-radius: 9px;
  padding: 10px 20px;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  white-space: nowrap;
  transition: background .15s;
}
.rs-print-btn:hover { background: #f1f5f9; }

/* Sheet */
.rs-sheet {
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 32px;
  box-shadow: 0 4px 24px rgba(0,0,0,.06);
}

/* School header */
.rs-school-header {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 20px;
}
.rs-school-logo-placeholder {
  font-size: 48px;
  line-height: 1;
  flex-shrink: 0;
}
.rs-school-text { flex: 1; }
.rs-school-name {
  font-size: 20px;
  font-weight: 800;
  color: #0f172a;
  margin: 0 0 2px;
  text-transform: uppercase;
  letter-spacing: .02em;
}
.rs-school-address { font-size: 12px; color: #64748b; margin: 0 0 4px; }
.rs-sheet-title {
  font-size: 13px;
  font-weight: 700;
  color: #6366f1;
  text-transform: uppercase;
  letter-spacing: .08em;
  margin: 0;
}

.rs-divider { height: 2px; background: #0f172a; margin: 0 0 20px; border-radius: 1px; }

/* Info grid */
.rs-info-grid { display: flex; flex-direction: column; gap: 10px; margin-bottom: 16px; }
.rs-info-row { display: flex; flex-wrap: wrap; gap: 0; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; }
.rs-info-cell {
  flex: 1;
  min-width: 120px;
  padding: 10px 14px;
  border-right: 1px solid #e2e8f0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.rs-info-cell:last-child { border-right: none; }
.rs-info-label {
  font-size: 9px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: .08em;
  color: #94a3b8;
}
.rs-info-val { font-size: 13px; font-weight: 700; color: #1e293b; }
.rs-info-val-large { font-size: 14px; }

/* Attendance */
.rs-attendance-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 16px;
  background: #f8fafc;
}
.rs-att-block {
  flex: 1;
  min-width: 100px;
  padding: 10px 14px;
  border-right: 1px solid #e2e8f0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}
.rs-att-block:last-child { border-right: none; }
.rs-att-label { font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: .07em; color: #94a3b8; text-align: center; }
.rs-att-val { font-size: 16px; font-weight: 800; color: #1e293b; }

/* Table */
.rs-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
  margin-bottom: 12px;
}
.rs-th {
  background: #0f172a;
  color: #fff;
  padding: 10px 10px;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: .05em;
  border: 1px solid #1e293b;
  text-align: center;
  line-height: 1.3;
}
.rs-th small { font-weight: 400; opacity: .7; }
.rs-th-subject { text-align: left; min-width: 160px; }
.rs-tr-even { background: #fff; }
.rs-tr-odd { background: #f8fafc; }
.rs-td {
  padding: 9px 10px;
  border: 1px solid #e2e8f0;
  color: #334155;
  vertical-align: middle;
}
.rs-td-subject { font-weight: 600; color: #1e293b; }
.rs-td-score, .rs-td-total, .rs-td-grade { text-align: center; }
.rs-td-total { font-weight: 700; font-size: 14px; color: #1e293b; }
.rs-grade {
  display: inline-block;
  padding: 2px 10px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: .05em;
}
.rs-td-remark { font-size: 11px; color: #64748b; }

.rs-tfoot { background: #f1f5f9; font-size: 12px; color: #475569; }

/* Grading key */
.rs-grading-key {
  display: flex;
  flex-wrap: wrap;
  gap: 6px 14px;
  font-size: 11px;
  padding: 8px 12px;
  background: #f8fafc;
  border-radius: 6px;
  margin-bottom: 16px;
  align-items: center;
}
.rs-key-title { font-weight: 700; color: #475569; text-transform: uppercase; letter-spacing: .05em; margin-right: 4px; }
.rs-key-item { white-space: nowrap; }

/* Comments */
.rs-comments {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 16px;
}
.rs-comment-block {
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 12px;
}
.rs-comment-label { font-size: 10px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: .07em; margin-bottom: 6px; }
.rs-comment-text { font-size: 13px; color: #334155; line-height: 1.5; min-height: 36px; margin-bottom: 10px; }
.rs-comment-sig { font-size: 11px; color: #94a3b8; }

/* Footer */
.rs-footer {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  padding-top: 16px;
  border-top: 2px solid #0f172a;
  gap: 20px;
  flex-wrap: wrap;
}
.rs-verify-code {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}
.rs-verify-label { font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: .06em; }
.rs-verify-val {
  font-family: monospace;
  font-size: 13px;
  font-weight: 700;
  color: #1e293b;
  background: #f1f5f9;
  border-radius: 6px;
  padding: 2px 10px;
  letter-spacing: .06em;
}
.rs-verify-url { font-size: 11px; color: #64748b; }
.rs-issued { font-size: 11px; color: #64748b; text-align: right; margin-bottom: 6px; }
.rs-school-stamp {
  border: 2px dashed #cbd5e1;
  border-radius: 8px;
  padding: 14px 24px;
  font-size: 11px;
  color: #cbd5e1;
  text-align: center;
  text-transform: uppercase;
  letter-spacing: .08em;
}

/* ── Print styles ── */
@media print {
  .no-print { display: none !important; }
  body { margin: 0; padding: 0; }
  .rs-page { padding: 0; max-width: 100%; }
  .rs-sheet {
    border: none;
    border-radius: 0;
    box-shadow: none;
    padding: 20px;
  }
  .rs-table { font-size: 11px; }
  .rs-th { font-size: 10px; padding: 7px 8px; }
  .rs-td { padding: 7px 8px; }
  .rs-school-name { font-size: 16px; }
}
`;