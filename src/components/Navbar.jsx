import React from 'react';
import { 
  Users, 
  LayoutGrid, 
  Lock, 
  Eye, 
  EyeOff, 
  Volume2, 
  VolumeX, 
  Maximize2, 
  Printer, 
  Sparkles,
  School
} from 'lucide-react';

export default function Navbar({
  className,
  setClassName,
  classesList,
  onAddClass,
  secretMode,
  setSecretMode,
  soundEnabled,
  onToggleSound,
  onOpenStudents,
  onOpenLayout,
  onOpenSecretRules,
  onPrint,
  ruleCount,
  studentCount,
  activeSeatCount
}) {
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  return (
    <header className="app-header">
      <div className="header-left">
        <div className="brand-logo">
          <div className="brand-icon">
            <School className="w-5 h-5 text-indigo-600" />
          </div>
          <div className="brand-info">
            <h1 className="brand-title">학급 자리 배치 도우미</h1>
            <span className="brand-subtitle">두근두근 우리 반 새로운 자리</span>
          </div>
        </div>

        <div className="class-selector-wrapper">
          <select 
            className="class-select"
            value={className}
            onChange={(e) => {
              if (e.target.value === "__NEW__") {
                const name = prompt("새 학급의 이름을 입력하세요 (예: 2학년 3반)");
                if (name && name.trim()) {
                  onAddClass(name.trim());
                }
              } else {
                setClassName(e.target.value);
              }
            }}
          >
            {classesList.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
            <option value="__NEW__">+ 새 학급 추가...</option>
          </select>
        </div>
      </div>

      <div className="header-actions">
        {/* 학생 명단 관리 버튼 */}
        <button 
          className="btn-header"
          onClick={onOpenStudents}
          title="학생 명단 및 성별 관리"
        >
          <Users className="w-4 h-4 text-slate-600" />
          <span>학생 명단</span>
          <span className="badge-count">{studentCount}명</span>
        </button>

        {/* 자리 구조 설정 버튼 */}
        <button 
          className="btn-header"
          onClick={onOpenLayout}
          title="교실 행/열 및 책상 배치 구조 설정"
        >
          <LayoutGrid className="w-4 h-4 text-slate-600" />
          <span>교실 구조</span>
          <span className={`badge-count ${activeSeatCount !== studentCount ? 'badge-warning' : ''}`}>
            {activeSeatCount}석
          </span>
        </button>

        {/* 교사용 특별 설정 (비공개 규칙) 버튼 */}
        <button 
          className={`btn-header ${secretMode ? 'btn-header-active' : ''}`}
          onClick={onOpenSecretRules}
          title="교사용 비밀 규칙 (고정 좌석, 짝 설정 등)"
        >
          <Lock className="w-4 h-4 text-amber-600" />
          <span>교사 맞춤 규칙</span>
          {ruleCount > 0 && (
            <span className="badge-count badge-amber">{ruleCount}개</span>
          )}
        </button>

        <div className="header-divider"></div>

        {/* 발표 모드 토글 (학생들에게 보여줄 때 비밀 규칙 숨김) */}
        <button 
          className={`btn-icon ${secretMode ? 'active' : ''}`}
          onClick={() => setSecretMode(!secretMode)}
          title={secretMode ? "교사용 모드 (비밀 규칙 및 태그 표시 중)" : "학생 발표 모드 (비밀 규칙 및 태그 숨김 중)"}
        >
          {secretMode ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          <span className="mode-label">{secretMode ? "교사용" : "발표용"}</span>
        </button>

        {/* 사운드 토글 */}
        <button 
          className="btn-icon"
          onClick={onToggleSound}
          title={soundEnabled ? "소리 끄기" : "소리 켜기"}
        >
          {soundEnabled ? <Volume2 className="w-4 h-4 text-indigo-600" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
        </button>

        {/* 전체 화면 */}
        <button 
          className="btn-icon"
          onClick={toggleFullscreen}
          title="전체 화면으로 보기 (전자칠판/빔프로젝터)"
        >
          <Maximize2 className="w-4 h-4" />
        </button>

        {/* 인쇄 및 내보내기 */}
        <button 
          className="btn-icon"
          onClick={onPrint}
          title="A4 좌석 배치표 인쇄"
        >
          <Printer className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}
