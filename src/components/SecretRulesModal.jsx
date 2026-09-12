import React, { useState } from 'react';
import { 
  Lock, 
  X, 
  Plus, 
  Trash2, 
  Pin, 
  HeartHandshake, 
  ShieldAlert, 
  Users, 
  Info,
  CheckCircle2
} from 'lucide-react';

export default function SecretRulesModal({
  isOpen,
  onClose,
  constraints,
  onUpdateConstraints,
  students,
  grid
}) {
  const [fixedStudentId, setFixedStudentId] = useState('');
  const [fixedSeatKey, setFixedSeatKey] = useState('');

  const [pairStudent1, setPairStudent1] = useState('');
  const [pairStudent2, setPairStudent2] = useState('');

  const [avoidStudent1, setAvoidStudent1] = useState('');
  const [avoidStudent2, setAvoidStudent2] = useState('');

  if (!isOpen) return null;

  const {
    fixedSeats = [],
    mustPair = [],
    avoidPair = [],
    genderMode = 'none'
  } = constraints;

  const studentMap = new Map(students.map(s => [s.id, s]));

  // 활성 좌석 목록
  const activeSeats = grid.activeSeats || [];

  // 1. 고정 좌석 추가
  const handleAddFixedSeat = () => {
    if (!fixedStudentId || !fixedSeatKey) return;
    const numId = Number(fixedStudentId);

    // 이미 다른 자리에 고정되어 있거나, 해당 자리에 다른 학생이 고정되어 있으면 덮어쓰기/필터링
    const filtered = fixedSeats.filter(
      r => r.studentId !== numId && r.seatKey !== fixedSeatKey
    );

    onUpdateConstraints({
      ...constraints,
      fixedSeats: [...filtered, { studentId: numId, seatKey: fixedSeatKey }]
    });

    setFixedStudentId('');
    setFixedSeatKey('');
  };

  const handleRemoveFixedSeat = (index) => {
    const updated = fixedSeats.filter((_, i) => i !== index);
    onUpdateConstraints({ ...constraints, fixedSeats: updated });
  };

  // 2. 짝 지정 추가
  const handleAddMustPair = () => {
    if (!pairStudent1 || !pairStudent2 || pairStudent1 === pairStudent2) return;
    const id1 = Number(pairStudent1);
    const id2 = Number(pairStudent2);

    // 중복 제거
    const filtered = mustPair.filter(
      ([a, b]) => !( (a === id1 && b === id2) || (a === id2 && b === id1) )
    );

    onUpdateConstraints({
      ...constraints,
      mustPair: [...filtered, [id1, id2]]
    });

    setPairStudent1('');
    setPairStudent2('');
  };

  const handleRemoveMustPair = (index) => {
    const updated = mustPair.filter((_, i) => i !== index);
    onUpdateConstraints({ ...constraints, mustPair: updated });
  };

  // 3. 짝 분리 추가
  const handleAddAvoidPair = () => {
    if (!avoidStudent1 || !avoidStudent2 || avoidStudent1 === avoidStudent2) return;
    const id1 = Number(avoidStudent1);
    const id2 = Number(avoidStudent2);

    const filtered = avoidPair.filter(
      ([a, b]) => !( (a === id1 && b === id2) || (a === id2 && b === id1) )
    );

    onUpdateConstraints({
      ...constraints,
      avoidPair: [...filtered, [id1, id2]]
    });

    setAvoidStudent1('');
    setAvoidStudent2('');
  };

  const handleRemoveAvoidPair = (index) => {
    const updated = avoidPair.filter((_, i) => i !== index);
    onUpdateConstraints({ ...constraints, avoidPair: updated });
  };

  // 4. 성별 모드 변경
  const handleGenderModeChange = (mode) => {
    onUpdateConstraints({
      ...constraints,
      genderMode: mode
    });
  };

  // 전체 초기화
  const handleClearAll = () => {
    if (window.confirm("설정된 모든 교사용 비밀 조건을 삭제하시겠습니까?")) {
      onUpdateConstraints({
        fixedSeats: [],
        mustPair: [],
        avoidPair: [],
        genderMode: 'none'
      });
    }
  };

  const totalRulesCount = fixedSeats.length + mustPair.length + avoidPair.length;

  return (
    <div className="modal-backdrop">
      <div className="modal-dialog modal-lg">
        {/* 헤더 */}
        <div className="modal-header">
          <div className="modal-title-wrap">
            <Lock className="w-5 h-5 text-amber-600" />
            <h2 className="modal-title">교사 맞춤 규칙 (비공개 설정)</h2>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="modal-body modal-body-scroll">
          {/* 비밀 보장 안내 배너 */}
          <div className="secret-notice-banner">
            <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-xs text-amber-900 leading-relaxed">
              <strong>교사용 안심 비공개 모드:</strong> 이 규칙들은 교사만 확인할 수 있습니다. 
              상단의 <strong>'발표용 모드'</strong>로 전환하면 전자칠판이나 빔프로젝터에 어떠한 규칙 표시도 남지 않고 완전한 랜덤 추첨처럼 자연스럽게 연출됩니다.
            </div>
          </div>

          {/* 1. 특정 학생 좌석 고정 */}
          <div className="rule-section-card">
            <div className="rule-section-header">
              <div className="rule-section-title">
                <Pin className="w-4 h-4 text-indigo-600" />
                <span>1. 특정 좌석 고정 (시력, 체격, 수업 집중도 고려)</span>
              </div>
              <span className="rule-section-badge">{fixedSeats.length}건</span>
            </div>
            <p className="rule-desc">
              특정 학생을 원하는 위치(예: 앞자리 교탁 바로 앞, 창가 쪽 등)로 지정합니다.
            </p>

            <div className="rule-input-row">
              <select
                className="input-field"
                value={fixedStudentId}
                onChange={(e) => setFixedStudentId(e.target.value)}
              >
                <option value="">-- 대상 학생 선택 --</option>
                {students.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.number}번 {s.name} ({s.gender === 'M' ? '남' : '여'})
                  </option>
                ))}
              </select>

              <select
                className="input-field"
                value={fixedSeatKey}
                onChange={(e) => setFixedSeatKey(e.target.value)}
              >
                <option value="">-- 배정할 자리 선택 --</option>
                {activeSeats.map(seatKey => {
                  const [r, c] = seatKey.split('-').map(Number);
                  return (
                    <option key={seatKey} value={seatKey}>
                      {r + 1}줄(행) {c + 1}번째 자리
                    </option>
                  );
                })}
              </select>

              <button 
                type="button" 
                className="btn-primary shrink-0"
                onClick={handleAddFixedSeat}
                disabled={!fixedStudentId || !fixedSeatKey}
              >
                <Plus className="w-4 h-4" />
                <span>고정 추가</span>
              </button>
            </div>

            {/* 고정 목록 */}
            {fixedSeats.length > 0 && (
              <div className="rule-chips-list">
                {fixedSeats.map((item, idx) => {
                  const s = studentMap.get(item.studentId);
                  const [r, c] = item.seatKey.split('-').map(Number);
                  return (
                    <div key={idx} className="rule-chip">
                      <span className="chip-name">{s ? `${s.number}번 ${s.name}` : `학생 #${item.studentId}`}</span>
                      <span className="chip-arrow">➔</span>
                      <span className="chip-seat">{r + 1}행 {c + 1}열</span>
                      <button 
                        type="button"
                        className="chip-remove"
                        onClick={() => handleRemoveFixedSeat(idx)}
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* 2. 짝 구성 임의 배치 (Must Pair) */}
          <div className="rule-section-card">
            <div className="rule-section-header">
              <div className="rule-section-title">
                <HeartHandshake className="w-4 h-4 text-emerald-600" />
                <span>2. 필수 짝꿍 배정 (함께 앉히고 싶은 두 명)</span>
              </div>
              <span className="rule-section-badge">{mustPair.length}쌍</span>
            </div>
            <p className="rule-desc">
              멘토-멘티 또는 함께 앉았을 때 서로 도움이 되는 두 학생을 가로 짝꿍으로 배정합니다.
            </p>

            <div className="rule-input-row">
              <select
                className="input-field"
                value={pairStudent1}
                onChange={(e) => setPairStudent1(e.target.value)}
              >
                <option value="">-- 학생 1 선택 --</option>
                {students.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.number}번 {s.name}
                  </option>
                ))}
              </select>

              <select
                className="input-field"
                value={pairStudent2}
                onChange={(e) => setPairStudent2(e.target.value)}
              >
                <option value="">-- 학생 2 선택 --</option>
                {students.map(s => (
                  <option key={s.id} value={s.id} disabled={String(s.id) === String(pairStudent1)}>
                    {s.number}번 {s.name}
                  </option>
                ))}
              </select>

              <button 
                type="button" 
                className="btn-primary shrink-0"
                onClick={handleAddMustPair}
                disabled={!pairStudent1 || !pairStudent2 || pairStudent1 === pairStudent2}
              >
                <Plus className="w-4 h-4" />
                <span>짝꿍 지정</span>
              </button>
            </div>

            {/* 짝꿍 목록 */}
            {mustPair.length > 0 && (
              <div className="rule-chips-list">
                {mustPair.map(([id1, id2], idx) => {
                  const s1 = studentMap.get(id1);
                  const s2 = studentMap.get(id2);
                  return (
                    <div key={idx} className="rule-chip chip-emerald">
                      <span className="chip-name">{s1 ? `${s1.number}번 ${s1.name}` : `#${id1}`}</span>
                      <span className="chip-arrow">🤝</span>
                      <span className="chip-name">{s2 ? `${s2.number}번 ${s2.name}` : `#${id2}`}</span>
                      <button 
                        type="button"
                        className="chip-remove"
                        onClick={() => handleRemoveMustPair(idx)}
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* 3. 짝꿍 분리 설정 (Avoid Pair) */}
          <div className="rule-section-card">
            <div className="rule-section-header">
              <div className="rule-section-title">
                <ShieldAlert className="w-4 h-4 text-rose-600" />
                <span>3. 짝꿍 분리 설정 (서로 짝이 되면 안 되는 두 명)</span>
              </div>
              <span className="rule-section-badge">{avoidPair.length}쌍</span>
            </div>
            <p className="rule-desc">
              수업 중 지나치게 장난을 치거나 갈등 예방을 위해 바로 옆자리에 앉지 않도록 분리합니다.
            </p>

            <div className="rule-input-row">
              <select
                className="input-field"
                value={avoidStudent1}
                onChange={(e) => setAvoidStudent1(e.target.value)}
              >
                <option value="">-- 학생 1 선택 --</option>
                {students.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.number}번 {s.name}
                  </option>
                ))}
              </select>

              <select
                className="input-field"
                value={avoidStudent2}
                onChange={(e) => setAvoidStudent2(e.target.value)}
              >
                <option value="">-- 학생 2 선택 --</option>
                {students.map(s => (
                  <option key={s.id} value={s.id} disabled={String(s.id) === String(avoidStudent1)}>
                    {s.number}번 {s.name}
                  </option>
                ))}
              </select>

              <button 
                type="button" 
                className="btn-primary shrink-0"
                onClick={handleAddAvoidPair}
                disabled={!avoidStudent1 || !avoidStudent2 || avoidStudent1 === avoidStudent2}
              >
                <Plus className="w-4 h-4" />
                <span>분리 지정</span>
              </button>
            </div>

            {/* 분리 목록 */}
            {avoidPair.length > 0 && (
              <div className="rule-chips-list">
                {avoidPair.map(([id1, id2], idx) => {
                  const s1 = studentMap.get(id1);
                  const s2 = studentMap.get(id2);
                  return (
                    <div key={idx} className="rule-chip chip-rose">
                      <span className="chip-name">{s1 ? `${s1.number}번 ${s1.name}` : `#${id1}`}</span>
                      <span className="chip-arrow">🚫</span>
                      <span className="chip-name">{s2 ? `${s2.number}번 ${s2.name}` : `#${id2}`}</span>
                      <button 
                        type="button"
                        className="chip-remove"
                        onClick={() => handleRemoveAvoidPair(idx)}
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* 4. 남녀 짝 구성 옵션 */}
          <div className="rule-section-card">
            <div className="rule-section-header">
              <div className="rule-section-title">
                <Users className="w-4 h-4 text-purple-600" />
                <span>4. 성별 짝 구성 규칙</span>
              </div>
            </div>
            <div className="gender-mode-options">
              <label className={`gender-option-card ${genderMode === 'none' ? 'active' : ''}`}>
                <input 
                  type="radio" 
                  name="genderMode"
                  checked={genderMode === 'none'}
                  onChange={() => handleGenderModeChange('none')}
                />
                <div className="gender-option-info">
                  <strong>성별 무관 (완전 자유)</strong>
                  <span>성별 구분 없이 순수 무작위로 배치합니다.</span>
                </div>
              </label>

              <label className={`gender-option-card ${genderMode === 'mixed' ? 'active' : ''}`}>
                <input 
                  type="radio" 
                  name="genderMode"
                  checked={genderMode === 'mixed'}
                  onChange={() => handleGenderModeChange('mixed')}
                />
                <div className="gender-option-info">
                  <strong>남-여 짝 우선 배정</strong>
                  <span>남학생과 여학생이 가급적 짝이 되도록 구성합니다.</span>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* 푸터 */}
        <div className="modal-footer modal-footer-between">
          <button 
            type="button"
            className="btn-link text-rose-500 text-sm"
            onClick={handleClearAll}
            disabled={totalRulesCount === 0 && genderMode === 'none'}
          >
            모든 맞춤 규칙 초기화
          </button>
          <button className="btn-primary" onClick={onClose}>
            규칙 저장 및 닫기
          </button>
        </div>
      </div>
    </div>
  );
}
