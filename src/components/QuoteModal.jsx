import React, { useState } from 'react';
import { RefreshCw, Play, X, Heart } from 'lucide-react';
import { getRandomQuote } from '../utils/quotes';

export default function QuoteModal({
  isOpen,
  onClose,
  onStartShuffle,
  currentQuote,
  onChangeQuote
}) {
  const [customEditing, setCustomEditing] = useState(false);
  const [customQuoteText, setCustomQuoteText] = useState("");

  if (!isOpen || !currentQuote) return null;

  return (
    <div className="quote-stage">
      {/* 무대 조명 */}
      <div className="quote-stage-light" aria-hidden="true" />
      <div className="quote-stage-vignette" aria-hidden="true" />

      <button className="quote-stage-close" onClick={onClose} title="닫기">
        <X className="w-5 h-5" />
      </button>

      <div className="quote-stage-inner">
        {/* 뱃지 */}
        <div className="quote-badge-container">
          <span className="quote-badge">
            <Heart className="w-4 h-4 fill-current" />
            <span>오늘의 자리 배치 생각 나눔</span>
          </span>
          {currentQuote.tag && (
            <span className="quote-tag">#{currentQuote.tag}</span>
          )}
        </div>

        {/* 본문 멘트 — 화면 가운데를 가득 채우는 타이틀 카드 */}
        <div className="quote-content-box">
          {customEditing ? (
            <div className="custom-quote-form">
              <textarea
                className="custom-quote-input"
                rows={3}
                value={customQuoteText}
                onChange={(e) => setCustomQuoteText(e.target.value)}
                placeholder="학생들에게 전하고 싶은 교훈이나 따뜻한 한마디를 입력하세요."
              />
              <div className="custom-quote-actions">
                <button
                  className="btn-sm btn-secondary"
                  onClick={() => setCustomEditing(false)}
                >
                  취소
                </button>
                <button
                  className="btn-sm btn-primary"
                  onClick={() => {
                    if (customQuoteText.trim()) {
                      onChangeQuote({
                        id: 9999,
                        quote: customQuoteText.trim(),
                        subtext: "선생님의 따뜻한 마음이 담긴 한마디",
                        tag: "선생님의 한마디"
                      });
                      setCustomEditing(false);
                    }
                  }}
                >
                  적용
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* key 로 멘트가 바뀔 때마다 등장 애니메이션 재생 */}
              <h2 className="quote-main-text" key={currentQuote.id}>
                <span className="quote-mark quote-mark-open" aria-hidden="true">“</span>
                {currentQuote.quote}
                <span className="quote-mark quote-mark-close" aria-hidden="true">”</span>
              </h2>
              {currentQuote.subtext && (
                <p className="quote-sub-text" key={`sub-${currentQuote.id}`}>
                  {currentQuote.subtext}
                </p>
              )}
            </>
          )}
        </div>

        <div className="quote-divider" aria-hidden="true" />

        {/* 버튼 영역 */}
        <div className="quote-modal-footer">
          <div className="quote-footer-left">
            <button
              className="btn-secondary btn-icon-text"
              onClick={() => {
                const next = getRandomQuote(currentQuote.id);
                onChangeQuote(next);
              }}
              title="다른 명언 랜덤 추천"
            >
              <RefreshCw className="w-4 h-4" />
              <span>다른 멘트 보기</span>
            </button>
            <button
              className="btn-link"
              onClick={() => {
                setCustomQuoteText(currentQuote.quote);
                setCustomEditing(true);
              }}
            >
              직접 입력
            </button>
          </div>

          <div className="quote-footer-right">
            <button
              className="btn-primary btn-start-reveal"
              onClick={() => {
                onClose();
                onStartShuffle();
              }}
            >
              <Play className="w-5 h-5 fill-current" />
              <span>두근두근 배치 시작!</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
