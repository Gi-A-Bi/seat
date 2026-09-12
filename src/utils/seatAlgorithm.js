/**
 * 공정하고 지능적인 좌석 배치 알고리즘
 * - 무작위 셔플 (기본)
 * - 교사용 비밀 조건 처리 (특정 학생 특정 자리 고정, 짝 배치, 짝 회피, 남녀 짝 구성)
 */

function shuffleArray(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// 두 좌석이 짝(가로 인접)인지 판별
export function areSeatsAdjacent(seatKey1, seatKey2) {
  if (!seatKey1 || !seatKey2) return false;
  const [r1, c1] = seatKey1.split("-").map(Number);
  const [r2, c2] = seatKey2.split("-").map(Number);
  return r1 === r2 && Math.abs(c1 - c2) === 1;
}

// 교실 그리드에서 자연스러운 짝(2인 1조) 슬롯 목록 추출
function findPairSlots(activeSeatsList) {
  const activeSet = new Set(activeSeatsList);
  const pairs = [];
  const visited = new Set();

  for (const seat of activeSeatsList) {
    if (visited.has(seat)) continue;
    const [r, c] = seat.split("-").map(Number);
    // 2열씩 묶음 기준: (0,1), (2,3), (4,5) 등
    const neighborCol = c % 2 === 0 ? c + 1 : c - 1;
    const neighborSeat = `${r}-${neighborCol}`;

    if (activeSet.has(neighborSeat) && !visited.has(neighborSeat)) {
      pairs.push([seat, neighborSeat]);
      visited.add(seat);
      visited.add(neighborSeat);
    }
  }
  return pairs;
}

export function generateSeatAssignments({
  students,
  activeSeats,
  constraints = {}
}) {
  const {
    fixedSeats = [],
    mustPair = [],
    avoidPair = [],
    genderMode = "none"
  } = constraints;

  const result = {};
  const studentMap = new Map(students.map(s => [s.id, s]));
  const assignedStudentIds = new Set();
  const occupiedSeats = new Set();

  // 1. 고정 좌석(Fixed Seats) 우선 배정
  fixedSeats.forEach(rule => {
    if (
      studentMap.has(rule.studentId) &&
      activeSeats.includes(rule.seatKey) &&
      !occupiedSeats.has(rule.seatKey) &&
      !assignedStudentIds.has(rule.studentId)
    ) {
      result[rule.seatKey] = rule.studentId;
      occupiedSeats.add(rule.seatKey);
      assignedStudentIds.add(rule.studentId);
    }
  });

  // 2. 짝 구성(Must Pair) 배정
  const pairSlots = shuffleArray(findPairSlots(activeSeats));
  mustPair.forEach(([id1, id2]) => {
    if (
      studentMap.has(id1) &&
      studentMap.has(id2) &&
      !assignedStudentIds.has(id1) &&
      !assignedStudentIds.has(id2)
    ) {
      // 빈 짝 슬롯 찾기
      const availableSlot = pairSlots.find(
        ([s1, s2]) => !occupiedSeats.has(s1) && !occupiedSeats.has(s2)
      );
      if (availableSlot) {
        const [s1, s2] = availableSlot;
        result[s1] = id1;
        result[s2] = id2;
        occupiedSeats.add(s1);
        occupiedSeats.add(s2);
        assignedStudentIds.add(id1);
        assignedStudentIds.add(id2);
      }
    }
  });

  // 남은 학생들과 남은 빈자리 수집
  let remainingStudents = students.filter(s => !assignedStudentIds.has(s.id));
  let remainingSeats = activeSeats.filter(seat => !occupiedSeats.has(seat));

  // 3. 성별 짝 모드 지원 (남녀 짝 선호 시)
  if (genderMode === "mixed") {
    const males = shuffleArray(remainingStudents.filter(s => s.gender === "M"));
    const females = shuffleArray(remainingStudents.filter(s => s.gender === "F"));
    const others = shuffleArray(remainingStudents.filter(s => s.gender !== "M" && s.gender !== "F"));

    const remainingPairSlots = pairSlots.filter(
      ([s1, s2]) => !occupiedSeats.has(s1) && !occupiedSeats.has(s2)
    );

    while (males.length > 0 && females.length > 0 && remainingPairSlots.length > 0) {
      const [s1, s2] = remainingPairSlots.pop();
      const m = males.pop();
      const f = females.pop();

      // 무작위로 좌/우 배치
      if (Math.random() > 0.5) {
        result[s1] = m.id;
        result[s2] = f.id;
      } else {
        result[s1] = f.id;
        result[s2] = m.id;
      }

      occupiedSeats.add(s1);
      occupiedSeats.add(s2);
      assignedStudentIds.add(m.id);
      assignedStudentIds.add(f.id);
    }

    remainingStudents = [...males, ...females, ...others];
    remainingSeats = activeSeats.filter(seat => !occupiedSeats.has(seat));
  }

  // 4. 나머지 학생 랜덤 무작위 셔플 및 짝 회피(Avoid Pair) 점검
  let shuffledStudents = shuffleArray(remainingStudents);
  let shuffledSeats = shuffleArray(remainingSeats);

  // 짝 회피 조건을 최대한 만족시키기 위한 최적화 (최대 15회 시도)
  let bestAttemptResult = { ...result };
  let minViolations = Infinity;

  const maxAttempts = avoidPair.length > 0 ? 15 : 1;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const tempResult = { ...result };
    const curStudents = shuffleArray(remainingStudents);
    const curSeats = shuffleArray(remainingSeats);

    const assignCount = Math.min(curStudents.length, curSeats.length);
    for (let i = 0; i < assignCount; i++) {
      tempResult[curSeats[i]] = curStudents[i].id;
    }

    // 회피 조건 위반 수 계산
    let violations = 0;
    avoidPair.forEach(([id1, id2]) => {
      let seat1 = null;
      let seat2 = null;
      for (const [seatKey, studentId] of Object.entries(tempResult)) {
        if (studentId === id1) seat1 = seatKey;
        if (studentId === id2) seat2 = seatKey;
      }
      if (seat1 && seat2 && areSeatsAdjacent(seat1, seat2)) {
        violations++;
      }
    });

    if (violations < minViolations) {
      minViolations = violations;
      bestAttemptResult = tempResult;
      if (violations === 0) break; // 완벽히 만족함
    }
  }

  return bestAttemptResult;
}
