import React from 'react';
import { ArrowLeftRight, X, Check } from 'lucide-react';

export default function SwapHelperBar({
  selectedSeatKey,
  student,
  onCancel
}) {
  if (!selectedSeatKey) return null;

  const [r, c] = selectedSeatKey.split('-').map(Number);

  return (
    <div className="swap-helper-bar">
      <div className="swap-helper-content">
        <div className="swap-icon-pulse">
          <ArrowLeftRight className="w-5 h-5 text-indigo-600" />
        </div>
        <div className="swap-text-wrap">
          <span className="swap-title">
            자리를 맞바꿀 대상 선택 중
          </span>
          <span className="swap-desc">
            현재 선택: <strong>{student ? `${student.number}번 ${student.name}` : `빈 좌석 (${r + 1}열 ${c + 1}행)`}</strong>
            &nbsp;➔ 맞바꾸고 싶은 다른 자리를 클릭하세요.
          </span>
        </div>
      </div>
      <button 
        className="btn-cancel-swap"
        onClick={onCancel}
        title="좌석 교환 취소"
      >
        <X className="w-4 h-4" />
        <span>교환 취소</span>
      </button>
    </div>
  );
}
