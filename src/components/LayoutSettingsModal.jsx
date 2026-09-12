import React from 'react';
import { 
  LayoutGrid, 
  X, 
  RotateCcw, 
  Check, 
  AlertCircle, 
  Columns, 
  Grid2X2,
  Sparkles
} from 'lucide-react';

export default function LayoutSettingsModal({
  isOpen,
  onClose,
  grid,
  onUpdateGrid,
  studentCount
}) {
  if (!isOpen) return null;

  const { rows, cols, activeSeats = [] } = grid;
  const activeSet = new Set(activeSeats);

  // 행 수 조절
  const handleRowsChange = (newRows) => {
    const val = Math.max(2, Math.min(8, Number(newRows)));
    // 새 크기에 맞춰 activeSeats 필터링 및 유지
    const updatedSeats = activeSeats.filter(s => {
      const [r] = s.split('-').map(Number);
      return r < val;
    });
    // 추가된 행은 기본 활성화
    for (let r = rows; r < val; r++) {
      for (let c = 0; c < cols; c++) {
        updatedSeats.push(`${r}-${c}`);
      }
    }
    onUpdateGrid({
      ...grid,
      rows: val,
      activeSeats: updatedSeats
    });
  };

  // 열 수 조절
  const handleColsChange = (newCols) => {
    const val = Math.max(2, Math.min(10, Number(newCols)));
    const updatedSeats = activeSeats.filter(s => {
      const [, c] = s.split('-').map(Number);
      return c < val;
    });
    for (let r = 0; r < rows; r++) {
      for (let c = cols; c < val; c++) {
        updatedSeats.push(`${r}-${c}`);
      }
    }
    onUpdateGrid({
      ...grid,
      cols: val,
      activeSeats: updatedSeats
    });
  };

  // 개별 좌석 토글 (클릭하여 책상 생성 또는 복도/빈자리로 전환)
  const toggleSeat = (row, col) => {
    const key = `${row}-${col}`;
    let nextActive;
    if (activeSet.has(key)) {
      nextActive = activeSeats.filter(s => s !== key);
    } else {
      nextActive = [...activeSeats, key];
    }
    onUpdateGrid({
      ...grid,
      activeSeats: nextActive
    });
  };

  // 프리셋 적용
  const applyPreset = (presetType) => {
    const newSeats = [];
    if (presetType === 'all') {
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          newSeats.push(`${r}-${c}`);
        }
      }
    } else if (presetType === 'pairs') {
      // 2인 1조 (기본적으로 짝을 이룸)
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          newSeats.push(`${r}-${c}`);
        }
      }
    } else if (presetType === 'u-shape') {
      // ㄷ자형
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          if (r === rows - 1 || c === 0 || c === cols - 1) {
            newSeats.push(`${r}-${c}`);
          }
        }
      }
    } else if (presetType === 'three-sections') {
      // 3분단 (열 6개 기준 0,1 / 통로 / 2,3 / 통로 / 4,5 형태)
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          newSeats.push(`${r}-${c}`);
        }
      }
    } else if (presetType === 'clear') {
      // 모두 끄기
    }

    onUpdateGrid({
      ...grid,
      activeSeats: newSeats,
      preset: presetType
    });
  };

  const activeCount = activeSeats.length;
  const isShortage = activeCount < studentCount;

  return (
    <div className="modal-backdrop">
      <div className="modal-dialog modal-lg">
        {/* 헤더 */}
        <div className="modal-header">
          <div className="modal-title-wrap">
            <LayoutGrid className="w-5 h-5 text-indigo-600" />
            <h2 className="modal-title">교실 좌석 구조 및 책상 배치</h2>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="modal-body modal-body-scroll">
          {/* 상단 컨트롤: 행/열 크기 설정 */}
          <div className="layout-config-controls">
            <div className="control-card">
              <label className="control-label">세로 행 (줄 수)</label>
              <div className="stepper-wrap">
                <button 
                  className="btn-stepper"
                  onClick={() => handleRowsChange(rows - 1)}
                  disabled={rows <= 2}
                >
                  -
                </button>
                <span className="stepper-value">{rows}행</span>
                <button 
                  className="btn-stepper"
                  onClick={() => handleRowsChange(rows + 1)}
                  disabled={rows >= 8}
                >
                  +
                </button>
              </div>
            </div>

            <div className="control-card">
              <label className="control-label">가로 열 (칸 수)</label>
              <div className="stepper-wrap">
                <button 
                  className="btn-stepper"
                  onClick={() => handleColsChange(cols - 1)}
                  disabled={cols <= 2}
                >
                  -
                </button>
                <span className="stepper-value">{cols}열</span>
                <button 
                  className="btn-stepper"
                  onClick={() => handleColsChange(cols + 1)}
                  disabled={cols >= 10}
                >
                  +
                </button>
              </div>
            </div>

            <div className="control-card status-card">
              <label className="control-label">책상 및 학생 현황</label>
              <div className="seat-status-indicator">
                <span className="font-semibold text-slate-800">
                  활성 책상 {activeCount}개
                </span>
                <span className="text-slate-400">/</span>
                <span>학생 {studentCount}명</span>
              </div>
              {isShortage && (
                <div className="shortage-warning">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>책상이 학생 수보다 {studentCount - activeCount}개 부족합니다.</span>
                </div>
              )}
            </div>
          </div>

          {/* 프리셋 버튼 바 */}
          <div className="preset-bar">
            <span className="preset-label">추천 구조:</span>
            <button 
              className="btn-preset" 
              onClick={() => {
                onUpdateGrid({ ...grid, rows: 4, cols: 6 });
                applyPreset('all');
              }}
            >
              기본 4행 6열 (24석)
            </button>
            <button className="btn-preset" onClick={() => applyPreset('all')}>
              전체 책상 켜기
            </button>
            <button className="btn-preset" onClick={() => applyPreset('u-shape')}>
              ㄷ자형 (토론식)
            </button>
            <button className="btn-preset text-rose-500" onClick={() => applyPreset('clear')}>
              모두 비우기
            </button>
          </div>

          {/* 대화형 책상 페인터 (클릭하여 책상/통로 토글) */}
          <div className="desk-painter-section">
            <div className="painter-header">
              <span className="font-medium text-slate-700 text-sm">
                좌석 배치 편집기 (클릭하여 책상을 켜거나 통로/빈자리로 변경하세요)
              </span>
              <div className="legend-pills">
                <span className="legend-item"><span className="swatch active-swatch"></span> 책상 활성</span>
                <span className="legend-item"><span className="swatch inactive-swatch"></span> 통로 / 빈공간</span>
              </div>
            </div>

            {/* 교탁/칠판 안내 */}
            <div className="painter-blackboard-indicator">
              칠판 및 교탁 (앞쪽)
            </div>

            <div 
              className="painter-grid"
              style={{
                gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`
              }}
            >
              {Array.from({ length: rows }).map((_, r) => (
                <React.Fragment key={r}>
                  {Array.from({ length: cols }).map((_, c) => {
                    const key = `${r}-${c}`;
                    const isActive = activeSet.has(key);
                    return (
                      <button
                        key={key}
                        type="button"
                        className={`painter-cell ${isActive ? 'active' : 'inactive'}`}
                        onClick={() => toggleSeat(r, c)}
                        title={`좌석 (${r + 1}행 ${c + 1}열) - 클릭하여 켜기/끄기`}
                      >
                        {isActive ? (
                          <span className="cell-num">{r + 1}-{c + 1}</span>
                        ) : (
                          <span className="cell-empty">빈자리</span>
                        )}
                      </button>
                    );
                  })}
                </React.Fragment>
              ))}
            </div>

            <div className="painter-footer-indicator">
              교실 뒤편
            </div>
          </div>
        </div>

        {/* 푸터 */}
        <div className="modal-footer">
          <button className="btn-primary" onClick={onClose}>
            설정 완료
          </button>
        </div>
      </div>
    </div>
  );
}
