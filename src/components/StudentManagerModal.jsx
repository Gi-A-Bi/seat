import React, { useState } from 'react';
import { 
  Users, 
  UserPlus, 
  Trash2, 
  UploadCloud, 
  X, 
  Check, 
  RotateCcw, 
  Sparkles,
  Info
} from 'lucide-react';
import { DEFAULT_STUDENTS_24 } from '../utils/storage';

export default function StudentManagerModal({
  isOpen,
  onClose,
  students,
  onUpdateStudents
}) {
  const [activeTab, setActiveTab] = useState('list'); // 'list' | 'bulk'
  const [bulkText, setBulkText] = useState('');
  const [newName, setNewName] = useState('');
  const [newGender, setNewGender] = useState('M');

  if (!isOpen) return null;

  // 학생 추가
  const handleAddStudent = (e) => {
    e?.preventDefault();
    if (!newName.trim()) return;

    const nextId = students.length > 0 ? Math.max(...students.map(s => s.id)) + 1 : 1;
    const nextNumber = students.length + 1;

    const updated = [
      ...students,
      {
        id: nextId,
        number: nextNumber,
        name: newName.trim(),
        gender: newGender
      }
    ];
    onUpdateStudents(updated);
    setNewName('');
  };

  // 학생 삭제
  const handleDeleteStudent = (id) => {
    const updated = students
      .filter(s => s.id !== id)
      .map((s, idx) => ({ ...s, number: idx + 1 })); // 번호 자동 재정렬
    onUpdateStudents(updated);
  };

  // 개별 학생 정보 수정
  const handleEditStudent = (id, field, value) => {
    const updated = students.map(s => {
      if (s.id === id) {
        return { ...s, [field]: value };
      }
      return s;
    });
    onUpdateStudents(updated);
  };

  // 대량 텍스트 입력 처리 (엔터, 쉼표 등으로 분리된 이름 일괄 등록)
  const handleBulkImport = () => {
    if (!bulkText.trim()) return;

    // 줄바꿈, 쉼표, 탭 등으로 분리
    const rawNames = bulkText
      .split(/[\n,]+/)
      .map(n => n.trim())
      .filter(n => n.length > 0);

    if (rawNames.length === 0) return;

    const newStudents = rawNames.map((name, index) => {
      // 이름 뒤에 (남), (여) 형태가 붙어있을 경우 파싱 지원
      let cleanName = name;
      let gender = 'M';
      if (name.endsWith('(여)') || name.endsWith('(F)')) {
        cleanName = name.replace(/\((여|F)\)$/, '').trim();
        gender = 'F';
      } else if (name.endsWith('(남)') || name.endsWith('(M)')) {
        cleanName = name.replace(/\((남|M)\)$/, '').trim();
        gender = 'M';
      } else {
        // 교대로 기본 성별 지정
        gender = index % 2 === 0 ? 'M' : 'F';
      }

      return {
        id: Date.now() + index,
        number: index + 1,
        name: cleanName,
        gender
      };
    });

    onUpdateStudents(newStudents);
    setBulkText('');
    setActiveTab('list');
  };

  // 기본 24명 예시 채우기
  const handleLoadDefaults = () => {
    if (window.confirm("현재 명단을 초기 기본 24명 명단으로 채우시겠습니까?")) {
      onUpdateStudents(DEFAULT_STUDENTS_24);
    }
  };

  const maleCount = students.filter(s => s.gender === 'M').length;
  const femaleCount = students.filter(s => s.gender === 'F').length;

  return (
    <div className="modal-backdrop">
      <div className="modal-dialog modal-lg">
        {/* 헤더 */}
        <div className="modal-header">
          <div className="modal-title-wrap">
            <Users className="w-5 h-5 text-indigo-600" />
            <h2 className="modal-title">학생 명단 관리</h2>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 탭 네비게이션 & 통계 */}
        <div className="modal-tab-bar">
          <div className="modal-tabs">
            <button 
              className={`tab-btn ${activeTab === 'list' ? 'active' : ''}`}
              onClick={() => setActiveTab('list')}
            >
              학생 목록 ({students.length}명)
            </button>
            <button 
              className={`tab-btn ${activeTab === 'bulk' ? 'active' : ''}`}
              onClick={() => setActiveTab('bulk')}
            >
              텍스트 일괄 등록
            </button>
          </div>

          <div className="stats-pill">
            <span>남 {maleCount}명</span>
            <span className="dot">•</span>
            <span>여 {femaleCount}명</span>
            <span className="dot">•</span>
            <strong>총 {students.length}명</strong>
          </div>
        </div>

        {/* 탭 내용 */}
        <div className="modal-body modal-body-scroll">
          {activeTab === 'list' && (
            <div className="student-list-container">
              {/* 학생 추가 폼 */}
              <form onSubmit={handleAddStudent} className="add-student-form">
                <input 
                  type="text" 
                  className="input-field name-input"
                  placeholder="새 학생 이름 (예: 김하늘)"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                />
                <select 
                  className="input-field gender-select"
                  value={newGender}
                  onChange={(e) => setNewGender(e.target.value)}
                >
                  <option value="M">남학생</option>
                  <option value="F">여학생</option>
                </select>
                <button type="submit" className="btn-primary btn-add">
                  <UserPlus className="w-4 h-4" />
                  <span>추가</span>
                </button>
                <button 
                  type="button" 
                  className="btn-secondary btn-reset-defaults"
                  onClick={handleLoadDefaults}
                  title="기본 24명 명단 채우기"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>예시 24명</span>
                </button>
              </form>

              {/* 학생 목록 테이블 */}
              <div className="student-table-wrap">
                <table className="student-table">
                  <thead>
                    <tr>
                      <th style={{ width: '60px' }}>번호</th>
                      <th>이름</th>
                      <th style={{ width: '120px' }}>성별</th>
                      <th style={{ width: '60px' }}>관리</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map((student) => (
                      <tr key={student.id}>
                        <td className="text-center font-mono">
                          {student.number}
                        </td>
                        <td>
                          <input 
                            type="text" 
                            className="table-input"
                            value={student.name}
                            onChange={(e) => handleEditStudent(student.id, 'name', e.target.value)}
                          />
                        </td>
                        <td>
                          <div className="gender-btn-group">
                            <button
                              type="button"
                              className={`gender-btn ${student.gender === 'M' ? 'gender-m active' : ''}`}
                              onClick={() => handleEditStudent(student.id, 'gender', 'M')}
                            >
                              남
                            </button>
                            <button
                              type="button"
                              className={`gender-btn ${student.gender === 'F' ? 'gender-f active' : ''}`}
                              onClick={() => handleEditStudent(student.id, 'gender', 'F')}
                            >
                              여
                            </button>
                          </div>
                        </td>
                        <td className="text-center">
                          <button 
                            className="btn-trash"
                            onClick={() => handleDeleteStudent(student.id)}
                            title="삭제"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {students.length === 0 && (
                      <tr>
                        <td colSpan={4} className="empty-notice">
                          등록된 학생이 없습니다. 이름을 입력하거나 예시 명단을 불러오세요.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'bulk' && (
            <div className="bulk-import-container">
              <div className="bulk-tip">
                <Info className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                <div>
                  <strong>엑셀 또는 나이스(NEIS) 명단 일괄 붙여넣기 안내:</strong>
                  <p className="text-xs text-slate-500 mt-1">
                    한 줄에 한 명씩 또는 쉼표(,)로 구분하여 이름을 붙여넣으세요. 이름 뒤에 (남), (여)를 붙이면 성별이 자동 지정됩니다.
                  </p>
                </div>
              </div>

              <textarea 
                className="bulk-textarea"
                rows={10}
                placeholder={`예시:\n김민수\n이지은(여)\n박도윤(남)\n최서현`}
                value={bulkText}
                onChange={(e) => setBulkText(e.target.value)}
              />

              <div className="bulk-actions">
                <button 
                  className="btn-secondary"
                  onClick={() => setActiveTab('list')}
                >
                  취소
                </button>
                <button 
                  className="btn-primary"
                  onClick={handleBulkImport}
                  disabled={!bulkText.trim()}
                >
                  <UploadCloud className="w-4 h-4" />
                  <span>일괄 명단 적용하기</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* 푸터 */}
        <div className="modal-footer">
          <button className="btn-primary" onClick={onClose}>
            완료
          </button>
        </div>
      </div>
    </div>
  );
}
