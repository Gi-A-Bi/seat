import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { 
  Play, 
  RotateCcw, 
  ArrowLeftRight, 
  Copy, 
  Check, 
  Sparkles, 
  Download, 
  Share2,
  Calendar,
  AlertCircle
} from 'lucide-react';

import IntroScreen from './components/IntroScreen';
import Navbar from './components/Navbar';
import ClassroomBoard from './components/ClassroomBoard';
import StudentManagerModal from './components/StudentManagerModal';
import LayoutSettingsModal from './components/LayoutSettingsModal';
import SecretRulesModal from './components/SecretRulesModal';
import QuoteModal from './components/QuoteModal';
import SwapHelperBar from './components/SwapHelperBar';

import { getInitialData, saveData } from './utils/storage';
import { soundManager } from './utils/sound';
import { getRandomQuote } from './utils/quotes';
import { generateSeatAssignments } from './utils/seatAlgorithm';

export default function App() {
  const [data, setData] = useState(() => getInitialData());

  // 인트로(타이틀 시퀀스) 노출 여부 — 입장 후에는 본 화면으로 전환
  const [showIntro, setShowIntro] = useState(true);
  const [activeModal, setActiveModal] = useState(null); // 'students' | 'layout' | 'secretRules' | 'quote' | null
  
  // 교사용 모드(true) vs 학생 발표 모드(false)
  const [secretMode, setSecretMode] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [perspective, setPerspective] = useState('student'); // 'student' | 'teacher'

  // 좌석 교환(스왑) 상태
  const [selectedSeatForSwap, setSelectedSeatForSwap] = useState(null);

  // 애니메이션 상태
  const [isShuffling, setIsShuffling] = useState(false);
  const [spinningNames, setSpinningNames] = useState({});
  const [lockedSeats, setLockedSeats] = useState(new Set());
  const [currentQuote, setCurrentQuote] = useState(() => getRandomQuote());
  const [copySuccess, setCopySuccess] = useState(false);

  // 데이터 변경 시 자동 저장
  useEffect(() => {
    saveData(data);
  }, [data]);

  const {
    className,
    classesList = ["우리 반 (1반)"],
    students = [],
    grid = { rows: 4, cols: 6, activeSeats: [] },
    constraints = { fixedSeats: [], mustPair: [], avoidPair: [], genderMode: 'none' },
    currentAssignments = {}
  } = data;

  const activeSeats = grid.activeSeats || [];
  const ruleCount = (constraints.fixedSeats?.length || 0) + 
                    (constraints.mustPair?.length || 0) + 
                    (constraints.avoidPair?.length || 0) + 
                    (constraints.genderMode !== 'none' ? 1 : 0);

  // 소리 켜기/끄기
  const handleToggleSound = () => {
    const nextState = soundManager.toggleSound();
    setSoundEnabled(nextState);
  };

  // 학생 명단 업데이트
  const handleUpdateStudents = (newStudents) => {
    setData(prev => ({
      ...prev,
      students: newStudents
    }));
  };

  // 교실 그리드 구조 업데이트
  const handleUpdateGrid = (newGrid) => {
    setData(prev => ({
      ...prev,
      grid: newGrid
    }));
  };

  // 교사 비밀 규칙 업데이트
  const handleUpdateConstraints = (newConstraints) => {
    setData(prev => ({
      ...prev,
      constraints: newConstraints
    }));
  };

  // 새 학급 추가
  const handleAddClass = (name) => {
    if (!classesList.includes(name)) {
      setData(prev => ({
        ...prev,
        className: name,
        classesList: [...prev.classesList, name],
        currentAssignments: {}
      }));
    } else {
      setData(prev => ({ ...prev, className: name }));
    }
  };

  // 좌석 배치 전 교훈 멘트 모달 열기
  const handleOpenQuoteBeforeShuffle = () => {
    if (students.length === 0) {
      alert("등록된 학생이 없습니다. 먼저 학생 명단을 추가해주세요.");
      setActiveModal('students');
      return;
    }
    if (activeSeats.length === 0) {
      alert("활성화된 책상이 없습니다. 교실 구조 설정에서 책상을 활성화해주세요.");
      setActiveModal('layout');
      return;
    }
    setCurrentQuote(getRandomQuote());
    setActiveModal('quote');
  };

  // 박진감 넘치는 자리 배치 애니메이션 시작
  const startRevealAnimation = () => {
    setIsShuffling(true);
    setSelectedSeatForSwap(null);
    setLockedSeats(new Set());

    // 최종 배정 결과 미리 계산
    const targetAssignments = generateSeatAssignments({
      students,
      activeSeats,
      constraints
    });

    const activeSeatsList = [...activeSeats];
    const studentNames = students.map(s => s.name);

    // 1단계: 1.6초간 전체 자리에서 초고속 슬롯머신 롤링 (두구두구 긴장감 조성)
    const spinStartTime = Date.now();
    const spinDuration = 1600;

    const spinInterval = setInterval(() => {
      const now = Date.now();
      const elapsed = now - spinStartTime;

      // 무작위 이름 할당으로 스피닝 효과
      const nextSpin = {};
      activeSeatsList.forEach(seatKey => {
        const randName = studentNames[Math.floor(Math.random() * studentNames.length)] || "???";
        nextSpin[seatKey] = randName;
      });
      setSpinningNames(nextSpin);
      soundManager.playTick(450 + Math.random() * 150);

      if (elapsed >= spinDuration) {
        clearInterval(spinInterval);

        // 2단계: 순차적으로 하나씩 또는 짝으로 착착 잠기며 reveal
        const newLocked = new Set();
        const assignmentsToLock = { ...targetAssignments };

        // 순서대로 좌석 확정 (앞쪽 행부터 파도타기)
        const sortedSeats = [...activeSeatsList].sort((a, b) => {
          const [r1, c1] = a.split('-').map(Number);
          const [r2, c2] = b.split('-').map(Number);
          if (r1 !== r2) return r1 - r2;
          return c1 - c2;
        });

        let lockIndex = 0;
        const lockStepInterval = Math.max(70, Math.min(180, 2400 / sortedSeats.length));

        const lockTimer = setInterval(() => {
          if (lockIndex < sortedSeats.length) {
            const seatKey = sortedSeats[lockIndex];
            newLocked.add(seatKey);
            setLockedSeats(new Set(newLocked));
            
            // 피치 점점 상승하며 박진감 넘치는 소리
            const pitch = 0.8 + (lockIndex / sortedSeats.length) * 0.8;
            soundManager.playLock(pitch);

            lockIndex++;
          } else {
            clearInterval(lockTimer);

            // 3단계: 완성! 승리의 팡파르 & 화려한 컨페티(폭죽) 축하
            setIsShuffling(false);
            setData(prev => ({
              ...prev,
              currentAssignments: assignmentsToLock
            }));

            soundManager.playFanfare();

            // 폭죽 효과
            confetti({
              particleCount: 120,
              spread: 80,
              origin: { y: 0.6 }
            });
            setTimeout(() => {
              confetti({
                particleCount: 80,
                angle: 60,
                spread: 55,
                origin: { x: 0 }
              });
              confetti({
                particleCount: 80,
                angle: 120,
                spread: 55,
                origin: { x: 1 }
              });
            }, 250);
          }
        }, lockStepInterval);
      }
    }, 60);
  };

  // 좌석 클릭 핸들러 (좌석 교환 지원)
  const handleSeatClick = (seatKey, student) => {
    if (isShuffling) return;

    if (!selectedSeatForSwap) {
      // 첫 번째 교환 대상 선택
      setSelectedSeatForSwap(seatKey);
      soundManager.playTick(600);
    } else if (selectedSeatForSwap === seatKey) {
      // 선택 취소
      setSelectedSeatForSwap(null);
    } else {
      // 두 번째 대상 클릭 -> 서로 맞바꾸기(Swap)
      const seatA = selectedSeatForSwap;
      const seatB = seatKey;

      const studentA = currentAssignments[seatA] || null;
      const studentB = currentAssignments[seatB] || null;

      setData(prev => {
        const nextAssignments = { ...prev.currentAssignments };
        if (studentB) nextAssignments[seatA] = studentB;
        else delete nextAssignments[seatA];

        if (studentA) nextAssignments[seatB] = studentA;
        else delete nextAssignments[seatB];

        return {
          ...prev,
          currentAssignments: nextAssignments
        };
      });

      soundManager.playSwap();
      setSelectedSeatForSwap(null);
    }
  };

  // 배치 초기화
  const handleResetAssignments = () => {
    if (window.confirm("현재 좌석 배치를 초기화하시겠습니까?")) {
      setData(prev => ({
        ...prev,
        currentAssignments: {}
      }));
      setSelectedSeatForSwap(null);
    }
  };

  // 배치 결과 텍스트 복사 (카카오톡, 학급 알림장용)
  const handleCopyResults = () => {
    const studentMap = new Map(students.map(s => [s.id, s]));
    let text = `[${className} 좌석 배치표]\n`;
    text += `배치일자: ${new Date().toLocaleDateString('ko-KR')}\n\n`;

    for (let r = 0; r < grid.rows; r++) {
      text += `■ ${r + 1}줄: `;
      const rowSeats = [];
      for (let c = 0; c < grid.cols; c++) {
        const key = `${r}-${c}`;
        if (activeSeats.includes(key)) {
          const sId = currentAssignments[key];
          const s = sId ? studentMap.get(sId) : null;
          rowSeats.push(s ? `${s.name}` : `[빈자리]`);
        } else {
          rowSeats.push(`(통로)`);
        }
      }
      text += rowSeats.join(' | ') + '\n';
    }

    navigator.clipboard.writeText(text).then(() => {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }).catch(() => {
      alert("클립보드 복사에 실패했습니다.");
    });
  };

  const handlePrint = () => {
    window.print();
  };

  const hasAssigned = Object.keys(currentAssignments).length > 0;
  const selectedStudent = selectedSeatForSwap 
    ? students.find(s => s.id === currentAssignments[selectedSeatForSwap])
    : null;

  if (showIntro) {
    return (
      <IntroScreen
        className={className}
        studentCount={students.length}
        seatCount={activeSeats.length}
        onEnter={() => setShowIntro(false)}
      />
    );
  }

  return (
    <div className="app-container app-entered">
      {/* 내비게이션 바 */}
      <Navbar
        className={className}
        setClassName={(name) => setData(prev => ({ ...prev, className: name }))}
        classesList={classesList}
        onAddClass={handleAddClass}
        secretMode={secretMode}
        setSecretMode={setSecretMode}
        soundEnabled={soundEnabled}
        onToggleSound={handleToggleSound}
        onOpenStudents={() => setActiveModal('students')}
        onOpenLayout={() => setActiveModal('layout')}
        onOpenSecretRules={() => setActiveModal('secretRules')}
        onPrint={handlePrint}
        ruleCount={ruleCount}
        studentCount={students.length}
        activeSeatCount={activeSeats.length}
      />

      {/* 메인 교실 영역 */}
      <main className="app-main">
        {/* 인쇄 전용 헤더 */}
        <div className="print-only-header">
          <h2>{className} 좌석 배치도</h2>
          <p>배치 일자: {new Date().toLocaleDateString('ko-KR')} | 담임 확인: ____________ (인)</p>
        </div>

        {/* 상단 액션 바 (배치 시작, 교환, 초기화, 결과 복사) */}
        <div className="action-control-dock">
          <div className="dock-left">
            <button
              className="btn-dock btn-dock-primary"
              onClick={handleOpenQuoteBeforeShuffle}
              disabled={isShuffling}
              title="학생들에게 교훈 멘트를 제시한 후 좌석 배치를 시작합니다."
            >
              <Play className="w-5 h-5 fill-current" />
              <span>{hasAssigned ? "다시 배치하기 (두근두근!)" : "좌석 배치 시작 (두근두근!)"}</span>
            </button>

            {hasAssigned && (
              <button
                className={`btn-dock btn-dock-secondary ${selectedSeatForSwap ? 'active' : ''}`}
                onClick={() => {
                  if (selectedSeatForSwap) {
                    setSelectedSeatForSwap(null);
                  } else {
                    alert("교환하고 싶은 첫 번째 자리를 클릭하세요.");
                  }
                }}
                disabled={isShuffling}
                title="배치 완료 후 두 자리를 선택하여 맞바꿉니다."
              >
                <ArrowLeftRight className="w-4 h-4 text-indigo-600" />
                <span>좌석 직접 교환</span>
              </button>
            )}

            {hasAssigned && (
              <button
                className="btn-dock btn-dock-subtle"
                onClick={handleResetAssignments}
                disabled={isShuffling}
                title="배치 결과를 지우고 빈 교실로 되돌립니다."
              >
                <RotateCcw className="w-4 h-4" />
                <span>초기화</span>
              </button>
            )}
          </div>

          <div className="dock-right">
            {hasAssigned && (
              <button
                className="btn-dock btn-dock-outline"
                onClick={handleCopyResults}
                title="배치 결과를 텍스트로 복사하여 카카오톡이나 알림장에 붙여넣기"
              >
                {copySuccess ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span className="text-emerald-600 font-semibold">복사 완료!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>결과 텍스트 복사</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* 안내 팁 배너 */}
        {!hasAssigned && !isShuffling && (
          <div className="classroom-welcome-banner">
            <Sparkles className="w-4 h-4 text-indigo-500 shrink-0" />
            <span>
              <strong>교실 준비 완료:</strong> 학생 {students.length}명, 활성 책상 {activeSeats.length}개.
              상단의 <strong>'좌석 배치 시작'</strong> 버튼을 누르면 교훈 멘트와 함께 박진감 넘치는 배치가 시작됩니다!
            </span>
          </div>
        )}

        {/* 교실 칠판 및 책상 그리드 보드 */}
        <ClassroomBoard
          grid={grid}
          students={students}
          assignments={currentAssignments}
          isShuffling={isShuffling}
          spinningNames={spinningNames}
          lockedSeats={lockedSeats}
          selectedSeatForSwap={selectedSeatForSwap}
          onSeatClick={handleSeatClick}
          secretMode={secretMode}
          constraints={constraints}
          perspective={perspective}
          onTogglePerspective={() => 
            setPerspective(prev => prev === 'student' ? 'teacher' : 'student')
          }
        />
      </main>

      {/* 좌석 교환 중일 때 하단 플로팅 안내 바 */}
      <SwapHelperBar
        selectedSeatKey={selectedSeatForSwap}
        student={selectedStudent}
        onCancel={() => setSelectedSeatForSwap(null)}
      />

      {/* 모달 창들 */}
      <StudentManagerModal
        isOpen={activeModal === 'students'}
        onClose={() => setActiveModal(null)}
        students={students}
        onUpdateStudents={handleUpdateStudents}
      />

      <LayoutSettingsModal
        isOpen={activeModal === 'layout'}
        onClose={() => setActiveModal(null)}
        grid={grid}
        onUpdateGrid={handleUpdateGrid}
        studentCount={students.length}
      />

      <SecretRulesModal
        isOpen={activeModal === 'secretRules'}
        onClose={() => setActiveModal(null)}
        constraints={constraints}
        onUpdateConstraints={handleUpdateConstraints}
        students={students}
        grid={grid}
      />

      <QuoteModal
        isOpen={activeModal === 'quote'}
        onClose={() => setActiveModal(null)}
        onStartShuffle={startRevealAnimation}
        currentQuote={currentQuote}
        onChangeQuote={setCurrentQuote}
      />
    </div>
  );
}
