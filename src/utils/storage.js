/**
 * 브라우저 LocalStorage 관리 유틸리티
 */

export const DEFAULT_STUDENTS_24 = [
  { id: 1, number: 1, name: "강민준", gender: "M" },
  { id: 2, number: 2, name: "김서윤", gender: "F" },
  { id: 3, number: 3, name: "김도윤", gender: "M" },
  { id: 4, number: 4, name: "김하은", gender: "F" },
  { id: 5, number: 5, name: "박시우", gender: "M" },
  { id: 6, number: 6, name: "박지우", gender: "F" },
  { id: 7, number: 7, name: "배서준", gender: "M" },
  { id: 8, number: 8, name: "송민서", gender: "F" },
  { id: 9, number: 9, name: "신유준", gender: "M" },
  { id: 10, number: 10, name: "안채원", gender: "F" },
  { id: 11, number: 11, name: "오하준", gender: "M" },
  { id: 12, number: 12, name: "유지아", gender: "F" },
  { id: 13, number: 13, name: "윤도현", gender: "M" },
  { id: 14, number: 14, name: "이예은", gender: "F" },
  { id: 15, number: 15, name: "이준우", gender: "M" },
  { id: 16, number: 16, name: "이서아", gender: "F" },
  { id: 17, number: 17, name: "임건우", gender: "M" },
  { id: 18, number: 18, name: "장서현", gender: "F" },
  { id: 19, number: 19, name: "정우진", gender: "M" },
  { id: 20, number: 20, name: "정다은", gender: "F" },
  { id: 21, number: 21, name: "조선우", gender: "M" },
  { id: 22, number: 22, name: "최수아", gender: "F" },
  { id: 23, number: 23, name: "한예준", gender: "M" },
  { id: 24, number: 24, name: "황지유", gender: "F" }
];

export const DEFAULT_GRID = {
  rows: 4,
  cols: 6,
  // 4행 6열 기본 활성화 (모든 자리 활성)
  activeSeats: (() => {
    const list = [];
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 6; c++) {
        list.push(`${r}-${c}`);
      }
    }
    return list;
  })(),
  preset: "pairs-2" // 2인 1조 짝 형태
};

const STORAGE_KEY = "classroom_seat_manager_data_v1";

export function getInitialData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.students && parsed.grid) {
        return parsed;
      }
    }
  } catch (e) {
    console.error("Failed to load local storage data:", e);
  }

  return {
    className: "우리 반 (1반)",
    classesList: ["우리 반 (1반)", "2반", "동아리"],
    students: DEFAULT_STUDENTS_24,
    grid: DEFAULT_GRID,
    constraints: {
      fixedSeats: [], // [{ studentId, seatKey: "r-c" }]
      mustPair: [],   // [[studentId1, studentId2]]
      avoidPair: [],  // [[studentId1, studentId2]]
      genderMode: "none" // "none" | "mixed" | "same"
    },
    currentAssignments: {}, // { "r-c": studentId }
    savedArrangements: [] // [{ id, date, name, assignments }]
  };
}

export function saveData(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error("Failed to save local storage data:", e);
  }
}
