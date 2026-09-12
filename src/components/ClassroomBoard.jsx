import React from 'react';
import { 
  ArrowLeftRight, 
  RotateCcw, 
  Sparkles, 
  Pin, 
  HeartHandshake, 
  Eye, 
  Compass,
  Volume2
} from 'lucide-react';

export default function ClassroomBoard({
  grid,
  students,
  assignments = {},
  isShuffling,
  spinningNames = {},
  lockedSeats = new Set(),
  selectedSeatForSwap,
  onSeatClick,
  secretMode,
  constraints = {},
  perspective, // 'student' | 'teacher'
  onTogglePerspective
}) {
  const { rows, cols, activeSeats = [] } = grid;
  const activeSet = new Set(activeSeats);
  const studentMap = new Map(students.map(s => [s.id, s]));

  // 비밀 규칙 태그 확인 헬퍼 (교사용 모드일 때만 표시)
  const getSecretTags = (studentId, seatKey) => {
    if (!secretMode || !studentId) return null;

    const isFixed = constraints.fixedSeats?.some(
      r => r.studentId === studentId && r.seatKey === seatKey
    );
    const isPaired = constraints.mustPair?.some(
      ([a, b]) => a === studentId || b === studentId
    );

    return { isFixed, isPaired };
  };

  // 행 순서: 학생 시점(칠판 상단 -> 행 0부터) vs 교사용 시점(칠판 하단 -> 행 0이 교탁에 가까움)
  const rowIndices = Array.from({ length: rows }, (_, i) => i);
  // 학생 시점일 때는 1행이 맨 앞(칠판 쪽), 교사 시점일 때도 1행이 칠판 쪽이지만 교탁 위치가 뒤바뀜
  const displayRowIndices = perspective === 'teacher' ? [...rowIndices].reverse() : rowIndices;

  return (
    <div className={`classroom-board-container perspective-${perspective}`}>
      {/* 교실 상단 칠판 영역 (학생 시점일 때) */}
      {perspective === 'student' && (
        <div className="blackboard-wrapper">
          <div className="blackboard">
            <div className="blackboard-frame">
              <span className="chalk-text">칠 판 (Front)</span>
              <div className="teacher-desk-marker">교탁</div>
            </div>
          </div>
        </div>
      )}

      {/* 교실 메인 그리드 및 좌우 벽면(창가/복도) */}
      <div className="classroom-main-layout">
        <div className="wall-indicator left-wall">
          <span className="wall-text">창 가 (Window)</span>
        </div>

        <div className="grid-scroll-wrap">
          <div 
            className="classroom-grid"
            style={{
              gridTemplateColumns: `repeat(${cols}, minmax(130px, 1fr))`
            }}
          >
            {displayRowIndices.map(r => (
              <React.Fragment key={r}>
                {Array.from({ length: cols }).map((_, c) => {
                  const seatKey = `${r}-${c}`;
                  const isActive = activeSet.has(seatKey);

                  if (!isActive) {
                    return (
                      <div 
                        key={seatKey} 
                        className="desk-slot desk-aisle"
                        title="통로 / 빈 공간"
                      >
                        <span className="aisle-indicator">통로</span>
                      </div>
                    );
                  }

                  const studentId = assignments[seatKey];
                  const student = studentId ? studentMap.get(studentId) : null;
                  const isLocked = lockedSeats.has(seatKey);
                  const isSpinning = isShuffling && !isLocked;
                  const spinningName = spinningNames[seatKey];
                  const isSelectedForSwap = selectedSeatForSwap === seatKey;
                  const secretTags = getSecretTags(studentId, seatKey);

                  return (
                    <div
                      key={seatKey}
                      className={`desk-card ${isActive ? 'active-desk' : ''} ${
                        isSpinning ? 'desk-spinning' : ''
                      } ${isLocked ? 'desk-locked' : ''} ${
                        isSelectedForSwap ? 'desk-selected-swap' : ''
                      } ${student ? `gender-${student.gender}` : 'desk-empty'}`}
                      onClick={() => onSeatClick(seatKey, student)}
                      role="button"
                      tabIndex={0}
                    >
                      {/* 책상 상단 메타 바 */}
                      <div className="desk-header">
                        <span className="desk-coord">{r + 1}열 {c + 1}행</span>
                        {/* 교사용 모드일 때만 보이는 비밀 뱃지 */}
                        {secretTags && (
                          <div className="secret-badges-wrap">
                            {secretTags.isFixed && (
                              <span className="secret-badge badge-pin" title="교사 설정: 고정 좌석">
                                📌
                              </span>
                            )}
                            {secretTags.isPaired && (
                              <span className="secret-badge badge-pair" title="교사 설정: 필수 짝꿍">
                                🤝
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      {/* 학생 정보 또는 스피닝 애니메이션 */}
                      <div className="desk-body">
                        {isSpinning ? (
                          <div className="spinning-content">
                            <span className="spinning-name">
                              {spinningName || "???"}
                            </span>
                          </div>
                        ) : student ? (
                          <div className="student-profile">
                            <span className="student-num-badge">
                              {student.number}번
                            </span>
                            <span className="student-name">
                              {student.name}
                            </span>
                          </div>
                        ) : (
                          <div className="empty-seat-placeholder">
                            <span>빈 좌석</span>
                          </div>
                        )}
                      </div>

                      {/* 책상 하단 상태 안내 */}
                      {isSelectedForSwap && (
                        <div className="swap-selection-banner">
                          선택됨 (바꿀 자리 클릭)
                        </div>
                      )}
                    </div>
                  );
                })}
              </React.Fragment>
            ))}
          </div>
        </div>

        <div className="wall-indicator right-wall">
          <span className="wall-text">복 도 (Door)</span>
        </div>
      </div>

      {/* 교사용 시점일 때 하단 칠판/교탁 영역 */}
      {perspective === 'teacher' && (
        <div className="blackboard-wrapper">
          <div className="blackboard">
            <div className="blackboard-frame">
              <span className="chalk-text">칠 판 및 교탁 (선생님 교탁 위치)</span>
              <div className="teacher-desk-marker">교탁</div>
            </div>
          </div>
        </div>
      )}

      {/* 시점 전환 플로팅 스위처 */}
      <div className="perspective-bar">
        <button
          className="btn-perspective"
          onClick={onTogglePerspective}
          title="교사용 시점(교탁 아래)과 학생용 시점(칠판 위)을 전환합니다."
        >
          <Compass className="w-4 h-4 text-indigo-600" />
          <span>시점: {perspective === 'student' ? '학생 시점 (칠판 앞쪽)' : '교사 시점 (교탁 쪽)'}</span>
        </button>
      </div>
    </div>
  );
}
