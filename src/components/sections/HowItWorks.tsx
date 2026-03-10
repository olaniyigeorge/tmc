export default function HowItWorksSection() {
  const steps = [
    {
      num: "1",
      title: "Enter Your Details",
      body: "Select your school, enter your student code, session, term, and the PIN shared by your teacher.",
    },
    {
      num: "2",
      title: "View Your Report",
      body: "Your full term report sheet loads securely — subject scores, grades, teacher comments and more.",
    },
    {
      num: "3",
      title: "Print or Save",
      body: "Use the Print button to save as PDF or print a physical copy directly from your browser.",
    },
  ];

  return (
    <section className="how-section" id="how">
      <p className="section-eyebrow" style={{ color: "var(--pink)" }}>
        Simple Process
      </p>
      <h2 className="section-title" style={{ color: "var(--dark)" }}>
        How to Access Your Result
      </h2>

      <div className="steps-grid">
        {steps.map((s) => (
          <div key={s.num} className="step">
            <div className="step-num">{s.num}</div>
            <h4>{s.title}</h4>
            <p>{s.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}