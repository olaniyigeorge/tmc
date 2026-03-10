"use client";
import { useState, useEffect } from "react";
import { resultTemplates } from "config/resultTemplates";
import Input from "ui/Input";
import Button from "ui/Button";

interface Props {
  initial?: any;
  onSave: (data: any) => void;
  onPublish: () => void;
  readonly?: boolean;
}

const ResultFormSecondary: React.FC<Props> = ({ initial, onSave, onPublish, readonly }) => {
  const [subjects, setSubjects] = useState<any[]>(initial?.subjects || []);

  useEffect(() => {
    if (subjects.length > 0) return;
    if ((!initial || !initial.subjects || initial.subjects.length === 0) && !subjects.length) {
      // prefill based on template default subjects
      const t = resultTemplates["TINABEL_SECONDARY"];
      if (t) {
        const defaults = t.defaultSubjects.map((name) => ({ name, scores: { test1: 0, test2: 0, exam: 0 } }));
        setSubjects(defaults);
      }
    }
  }, []);

  const handleChange = (idx: number, field: string, value: any) => {
    const copy = [...subjects];
    copy[idx].scores = { ...copy[idx].scores, [field]: value };
    setSubjects(copy);
  };
  const addSubject = () => {
    setSubjects([...subjects, { name: "", scores: { test1: 0, test2: 0, exam: 0 } }]);
  };
  const save = () => {
    onSave({ subjects });
  };

  return (
    <div>
      {subjects.map((s, idx) => (
        <div key={idx} className="flex gap-2 mb-2">
          <Input
            disabled={readonly}
            placeholder="Subject"
            value={s.name}
            onChange={(e) => {
              const c = [...subjects];
              c[idx].name = e.target.value;
              setSubjects(c);
            }}
          />
          <Input
            disabled={readonly}
            type="number"
            placeholder="Test1"
            value={s.scores.test1}
            onChange={(e) => handleChange(idx, "test1", Number(e.target.value))}
          />
          <Input
            disabled={readonly}
            type="number"
            placeholder="Test2"
            value={s.scores.test2}
            onChange={(e) => handleChange(idx, "test2", Number(e.target.value))}
          />
          <Input
            disabled={readonly}
            type="number"
            placeholder="Exam"
            value={s.scores.exam}
            onChange={(e) => handleChange(idx, "exam", Number(e.target.value))}
          />
        </div>
      ))}
      {!readonly && <Button onClick={addSubject}>Add Subject</Button>}
      <div className="mt-4">
        {!readonly && <Button onClick={save}>Save Draft</Button>}
        {!readonly && <Button onClick={onPublish} className="ml-2">Publish</Button>}
      </div>
    </div>
  );
};

export default ResultFormSecondary;