/**
 * 상식 퀴즈 챌린지 - 앱 초기화 및 화면 전환
 */
const App = (() => {
  // 화면 요소
  const screens = {
    home: document.getElementById('home-screen'),
    quiz: document.getElementById('quiz-screen'),
    transition: document.getElementById('category-transition-screen'),
    result: document.getElementById('result-screen'),
    ranking: document.getElementById('ranking-screen')
  };

  // 화면 전환
  function showScreen(screenId) {
    Object.values(screens).forEach(screen => {
      screen.classList.add('hidden');
    });
    if (screens[screenId]) {
      screens[screenId].classList.remove('hidden');
    }
  }

  // 이벤트 바인딩
  function bindEvents() {
    // 게임 시작
    document.getElementById('start-btn').addEventListener('click', () => {
      const nickname = document.getElementById('nickname-input').value.trim();
      const errorEl = document.getElementById('nickname-error');

      if (!nickname) {
        errorEl.classList.remove('hidden');
        return;
      }
      errorEl.classList.add('hidden');
      Quiz.start(nickname);
      showScreen('quiz');
    });

    // 순위 보기
    document.getElementById('ranking-btn').addEventListener('click', () => {
      Ranking.render();
      showScreen('ranking');
    });

    // 순위 → 메인
    document.getElementById('ranking-home-btn').addEventListener('click', () => {
      showScreen('home');
    });

    // 결과 → 다시 하기
    document.getElementById('retry-btn').addEventListener('click', () => {
      Quiz.start(Quiz.getNickname());
      showScreen('quiz');
    });

    // 결과 → 메인
    document.getElementById('home-btn').addEventListener('click', () => {
      showScreen('home');
    });

    // 카테고리 전환 → 계속하기
    document.getElementById('continue-btn').addEventListener('click', () => {
      Quiz.nextCategory();
      showScreen('quiz');
    });

    // 다음 문제
    document.getElementById('next-btn').addEventListener('click', () => {
      Quiz.nextQuestion();
    });

    // 닉네임 입력 시 에러 메시지 숨기기
    document.getElementById('nickname-input').addEventListener('input', () => {
      document.getElementById('nickname-error').classList.add('hidden');
    });
  }

  // 초기화
  function init() {
    showScreen('home');
    bindEvents();
  }

  document.addEventListener('DOMContentLoaded', init);

  return { showScreen };
})();
