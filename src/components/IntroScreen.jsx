import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Play } from 'lucide-react';

const TITLE_MAIN = '우리 반 새로운 자리';
const TITLE_KICKER = '두근두근';

// 화면을 떠도는 먼지 입자 — 매 마운트마다 고정된 난수 배치
function buildMotes(count) {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    top: Math.random() * 100,
    size: 1 + Math.random() * 2.4,
    delay: Math.random() * 12,
    duration: 14 + Math.random() * 16,
    drift: (Math.random() - 0.5) * 120
  }));
}

export default function IntroScreen({
  className,
  studentCount = 0,
  seatCount = 0,
  onEnter
}) {
  const [leaving, setLeaving] = useState(false);
  const motes = useMemo(() => buildMotes(34), []);
  const year = new Date().getFullYear();

  const handleEnter = useCallback(() => {
    if (leaving) return;
    setLeaving(true);
    window.setTimeout(() => onEnter(), 620);
  }, [leaving, onEnter]);

  // Enter / Space / Esc 로도 입장
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'Escape') {
        e.preventDefault();
        handleEnter();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [handleEnter]);

  return (
    <div className={`intro-stage ${leaving ? 'is-leaving' : ''}`}>
      {/* 무대 조명 */}
      <div className="intro-beam intro-beam-a" />
      <div className="intro-beam intro-beam-b" />
      <div className="intro-vignette" />

      {/* 떠도는 먼지 */}
      <div className="intro-motes" aria-hidden="true">
        {motes.map(m => (
          <span
            key={m.id}
            className="intro-mote"
            style={{
              left: `${m.left}%`,
              top: `${m.top}%`,
              width: `${m.size}px`,
              height: `${m.size}px`,
              '--mote-drift': `${m.drift}px`,
              animationDelay: `${m.delay}s`,
              animationDuration: `${m.duration}s`
            }}
          />
        ))}
      </div>

      <div className="intro-content">
        <div className="intro-eyebrow">
          <span className="intro-rule" />
          <span>{year} · {className}</span>
          <span className="intro-rule" />
        </div>

        <div className="intro-kicker">
          {TITLE_KICKER.split('').map((ch, i) => (
            <span key={i} style={{ animationDelay: `${0.35 + i * 0.09}s` }}>
              {ch}
            </span>
          ))}
        </div>

        <h1 className="intro-title">
          {TITLE_MAIN.split('').map((ch, i) => (
            <span
              key={i}
              className={ch === ' ' ? 'intro-title-space' : 'intro-title-ch'}
              style={{ animationDelay: `${0.75 + i * 0.075}s` }}
            >
              {ch === ' ' ? ' ' : ch}
            </span>
          ))}
          <span className="intro-title-shine" aria-hidden="true" />
        </h1>

        <div className="intro-divider" />

        <button className="intro-cta" onClick={handleEnter} autoFocus>
          <span className="intro-cta-glow" aria-hidden="true" />
          <Play className="w-5 h-5 fill-current" />
          <span>자리 배치 시작</span>
        </button>

        <div className="intro-meta">
          <span>학생 {studentCount}명</span>
          <span className="intro-meta-dot">·</span>
          <span>책상 {seatCount}석</span>
          <span className="intro-meta-dot">·</span>
          <span>Enter 로도 시작</span>
        </div>
      </div>
    </div>
  );
}
