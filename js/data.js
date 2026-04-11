/**
 * 상식 퀴즈 챌린지 - 퀴즈 데이터
 * 카테고리: 한국사, 과학, 지리, 일반상식 (각 10문제, 총 40문제)
 */
const quizData = {
  "한국사": [
    {
      question: "조선을 건국한 인물은 누구인가?",
      options: ["왕건", "이성계", "김유신", "이순신"],
      answer: 1
    },
    {
      question: "한글을 창제한 왕은 누구인가?",
      options: ["세종대왕", "태종", "성종", "영조"],
      answer: 0
    },
    {
      question: "임진왜란이 일어난 해는?",
      options: ["1492년", "1592년", "1692년", "1392년"],
      answer: 1
    },
    {
      question: "고려를 건국한 인물은 누구인가?",
      options: ["궁예", "견훤", "왕건", "장보고"],
      answer: 2
    },
    {
      question: "3·1 운동이 일어난 해는?",
      options: ["1910년", "1945년", "1919년", "1926년"],
      answer: 2
    },
    {
      question: "조선시대 신분 제도에서 가장 높은 계층은?",
      options: ["중인", "상민", "양반", "천민"],
      answer: 2
    },
    {
      question: "대한민국 임시정부가 수립된 도시는?",
      options: ["도쿄", "베이징", "상하이", "워싱턴"],
      answer: 2
    },
    {
      question: "훈민정음이 반포된 해는?",
      options: ["1443년", "1446년", "1450년", "1392년"],
      answer: 1
    },
    {
      question: "거북선을 만든 인물은 누구인가?",
      options: ["권율", "곽재우", "이순신", "김시민"],
      answer: 2
    },
    {
      question: "6·25 전쟁이 발발한 해는?",
      options: ["1948년", "1950년", "1953년", "1945년"],
      answer: 1
    }
  ],

  "과학": [
    {
      question: "물의 화학식은?",
      options: ["CO2", "H2O", "NaCl", "O2"],
      answer: 1
    },
    {
      question: "지구에서 가장 풍부한 기체는?",
      options: ["산소", "이산화탄소", "질소", "수소"],
      answer: 2
    },
    {
      question: "빛의 3원색이 아닌 것은?",
      options: ["빨강", "초록", "노랑", "파랑"],
      answer: 2
    },
    {
      question: "인체에서 가장 큰 장기는?",
      options: ["심장", "폐", "간", "피부"],
      answer: 3
    },
    {
      question: "태양계에서 가장 큰 행성은?",
      options: ["토성", "목성", "해왕성", "천왕성"],
      answer: 1
    },
    {
      question: "DNA의 이중나선 구조를 발견한 과학자는?",
      options: ["뉴턴", "아인슈타인", "왓슨과 크릭", "다윈"],
      answer: 2
    },
    {
      question: "소리의 속도(20°C 공기 중)에 가장 가까운 값은?",
      options: ["약 120m/s", "약 340m/s", "약 500m/s", "약 760m/s"],
      answer: 1
    },
    {
      question: "원소 기호 'Fe'는 어떤 원소를 나타내는가?",
      options: ["구리", "금", "철", "납"],
      answer: 2
    },
    {
      question: "광합성에 필요하지 않은 것은?",
      options: ["빛", "이산화탄소", "물", "산소"],
      answer: 3
    },
    {
      question: "절대온도 0K(켈빈)는 섭씨 몇 도인가?",
      options: ["-100°C", "-273°C", "0°C", "-373°C"],
      answer: 1
    }
  ],

  "지리": [
    {
      question: "세계에서 가장 큰 대륙은?",
      options: ["아프리카", "북아메리카", "유럽", "아시아"],
      answer: 3
    },
    {
      question: "대한민국의 수도는?",
      options: ["부산", "서울", "인천", "대전"],
      answer: 1
    },
    {
      question: "세계에서 가장 긴 강은?",
      options: ["아마존강", "나일강", "양쯔강", "미시시피강"],
      answer: 1
    },
    {
      question: "독도는 어느 바다에 위치하는가?",
      options: ["황해", "남해", "동해", "태평양"],
      answer: 2
    },
    {
      question: "세계에서 가장 높은 산은?",
      options: ["K2", "에베레스트산", "킬리만자로산", "몽블랑산"],
      answer: 1
    },
    {
      question: "호주의 수도는?",
      options: ["시드니", "멜버른", "캔버라", "브리즈번"],
      answer: 2
    },
    {
      question: "아프리카에서 가장 면적이 넓은 나라는?",
      options: ["이집트", "남아프리카공화국", "나이지리아", "알제리"],
      answer: 3
    },
    {
      question: "제주도의 최고봉 한라산의 높이에 가장 가까운 것은?",
      options: ["약 1,950m", "약 1,500m", "약 2,200m", "약 1,700m"],
      answer: 0
    },
    {
      question: "적도가 지나지 않는 나라는?",
      options: ["브라질", "케냐", "인도네시아", "호주"],
      answer: 3
    },
    {
      question: "세계에서 가장 넓은 나라는?",
      options: ["캐나다", "중국", "미국", "러시아"],
      answer: 3
    }
  ],

  "일반상식": [
    {
      question: "올림픽은 몇 년마다 개최되는가?",
      options: ["2년", "3년", "4년", "5년"],
      answer: 2
    },
    {
      question: "UN 안전보장이사회 상임이사국이 아닌 나라는?",
      options: ["미국", "독일", "중국", "러시아"],
      answer: 1
    },
    {
      question: "피카소의 국적은?",
      options: ["이탈리아", "프랑스", "스페인", "포르투갈"],
      answer: 2
    },
    {
      question: "'로미오와 줄리엣'의 작가는?",
      options: ["찰스 디킨스", "셰익스피어", "괴테", "빅토르 위고"],
      answer: 1
    },
    {
      question: "세계보건기구의 약칭은?",
      options: ["WTO", "WHO", "UNESCO", "UNICEF"],
      answer: 1
    },
    {
      question: "축구 월드컵은 몇 년마다 열리는가?",
      options: ["2년", "3년", "4년", "5년"],
      answer: 2
    },
    {
      question: "비타민 C가 가장 풍부한 과일은?",
      options: ["사과", "바나나", "키위", "포도"],
      answer: 2
    },
    {
      question: "대한민국 국화(나라꽃)는?",
      options: ["장미", "무궁화", "진달래", "벚꽃"],
      answer: 1
    },
    {
      question: "이모티콘 '😂'의 공식 유니코드 이름에 해당하는 뜻은?",
      options: ["큰 소리로 우는 얼굴", "기쁨의 눈물 흘리는 얼굴", "웃는 얼굴", "윙크하는 얼굴"],
      answer: 1
    },
    {
      question: "1년이 366일인 해를 무엇이라 하는가?",
      options: ["평년", "윤년", "갑자년", "회년"],
      answer: 1
    }
  ]
};
