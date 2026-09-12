/**
 * 좌석 배치 전 학생들에게 감동과 교훈을 주는 추천 멘트 모음
 */
export const CLASSROOM_QUOTES = [
  {
    id: 1,
    quote: "짝이 누구인지보다, 내가 어떤 짝인지가 중요합니다.",
    subtext: "좋은 친구를 바란다면 먼저 좋은 친구가 되어주세요.",
    tag: "우정과 배려"
  },
  {
    id: 2,
    quote: "새로운 자리는 새로운 친구와 새로운 추억을 만드는 출발선입니다.",
    subtext: "어색함은 잠시뿐, 곧 우리 반의 소중한 단짝이 될 거예요.",
    tag: "새로운 시작"
  },
  {
    id: 3,
    quote: "서로 다름을 인정하고 배려할 때, 우리 교실은 가장 따뜻해집니다.",
    subtext: "나와 다른 친구의 장점을 먼저 찾아보는 멋진 하루를 보내요.",
    tag: "존중과 공감"
  },
  {
    id: 4,
    quote: "자리가 사람을 만드는 것이 아니라, 사람이 자리를 빛냅니다.",
    subtext: "어디에 앉든 그 자리에서 반짝반짝 빛나는 사람이 됩시다.",
    tag: "자신감"
  },
  {
    id: 5,
    quote: "마음을 열면 누구와도 최고의 짝꿍이 될 수 있습니다.",
    subtext: "오늘 먼저 따뜻한 미소와 '안녕!' 인사를 건네보세요.",
    tag: "먼저 다가가기"
  },
  {
    id: 6,
    quote: "혼자 가면 빨리 가지만, 함께 가면 멀리 갑니다.",
    subtext: "수업 시간에도, 쉬는 시간에도 서로 돕고 함께 성장하는 짝꿍이 됩시다.",
    tag: "협동과 성장"
  },
  {
    id: 7,
    quote: "모든 친구에게는 내가 아직 모르는 멋진 배울 점이 있습니다.",
    subtext: "한 달 동안 짝꿍의 숨겨진 보물 같은 장점을 발견해보세요.",
    tag: "발견과 배움"
  },
  {
    id: 8,
    quote: "작은 양보와 따뜻한 말 한마디가 교실의 행복을 만듭니다.",
    subtext: "지우개 하나 빌려주는 작은 친절이 깊은 우정의 씨앗이 됩니다.",
    tag: "친절"
  },
  {
    id: 9,
    quote: "인연은 우연히 찾아오지만, 좋은 우정은 노력으로 피어납니다.",
    subtext: "오늘 정해지는 짝꿍과 소중한 인연을 예쁘게 가꾸어보세요.",
    tag: "인연"
  },
  {
    id: 10,
    quote: "우리 반은 톱니바퀴처럼 서로가 연결되어 있을 때 가장 힘차게 돌아갑니다.",
    subtext: "누구 하나 소외되지 않는, 모두가 주인공인 우리 교실을 만들어요.",
    tag: "공동체"
  }
];

export function getRandomQuote(excludeId = null) {
  const filtered = excludeId 
    ? CLASSROOM_QUOTES.filter(q => q.id !== excludeId)
    : CLASSROOM_QUOTES;
  const randomIndex = Math.floor(Math.random() * filtered.length);
  return filtered[randomIndex] || CLASSROOM_QUOTES[0];
}
