"use client";

import { useRouter } from "next/navigation";
import { useState, KeyboardEvent } from "react";

export default function VerifyStrip() {
  const [code, setCode] = useState("");
  const router = useRouter();

  function handleVerify() {
    const trimmed = code.trim();
    if (trimmed) router.push(`/verify/${encodeURIComponent(trimmed)}`);
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") handleVerify();
  }

  return (
    <div className="verify-strip">
      <p>
        Have a verification code from a printed result sheet? Confirm it&apos;s
        authentic in seconds.
      </p>
      <div className="verify-input-row">
        <input
          className="verify-input"
          type="text"
          placeholder="e.g.  TMC-2526-1ST-JSS1A-8F3K2"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button className="verify-btn" onClick={handleVerify}>
          Verify →
        </button>
      </div>
    </div>
  );
}