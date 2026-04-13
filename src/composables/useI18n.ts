import { ref, computed } from 'vue'

export type Lang = 'zh' | 'en'

const currentLang = ref<Lang>((localStorage.getItem('lang') as Lang) || 'en')

const messages = {
  zh: {
    title: '计算24',
    introDesc: '利用四则运算，使得4个随机数的运算结果等于24',
    introStep1: '拖动数字，改变其位置',
    introStep2: '点击运算符，切换加减乘除',
    introStep3: '选择括号模式，改变运算顺序',
    introStep4: '让结果等于24',
    startGame: '开始游戏',
    moves: '移动',
    score: '得分',
    guide: '拖拽数字交换位置 · 点击运算符切换 · 选择括号改变顺序',
    bracketMode: '括号模式',
    noBracket: '无括号',
    scoringTitle: '得分规则',
    scoringBase: '基础分：',
    scoringBaseVal: '20分',
    scoringMoves: '移动奖励：',
    scoringMovesVal: '移动次数越少奖励越高（上限40次内，每少5次+1分）',
    scoringTime: '时间奖励：',
    scoringTimeVal: '剩余秒数 / 10（向下取整）',
    winTitle: '答案正确!',
    totalScore: '累计得分：',
    nextRound: '立即开始下一轮',
    autoCountdown: '自动开始倒计时：',
    seconds: '秒',
    loseTitle: '时间到!',
    referenceAnswer: '参考答案：',
    playAgain: '再来一局',
    estimatedScore: '预计得分',
  },
  en: {
    title: 'Calc 24',
    introDesc: 'Use four arithmetic operations to make 4 random numbers equal 24',
    introStep1: 'Drag numbers to swap positions',
    introStep2: 'Tap operators to cycle +, -, ×, ÷',
    introStep3: 'Choose bracket mode to change order',
    introStep4: 'Make the result equal 24',
    startGame: 'Start Game',
    moves: 'Moves',
    score: 'Score',
    guide: 'Drag to swap · Tap operator to cycle · Pick brackets to reorder',
    bracketMode: 'Bracket Mode',
    noBracket: 'None',
    scoringTitle: 'Scoring Rules',
    scoringBase: 'Base: ',
    scoringBaseVal: '20 pts',
    scoringMoves: 'Move bonus: ',
    scoringMovesVal: 'Fewer moves = higher bonus (within 40, +1 per 5 fewer)',
    scoringTime: 'Time bonus: ',
    scoringTimeVal: 'Remaining seconds / 10 (rounded down)',
    winTitle: 'Correct!',
    totalScore: 'Total score: ',
    nextRound: 'Start Next Round',
    autoCountdown: 'Auto start in ',
    seconds: 's',
    loseTitle: "Time's Up!",
    referenceAnswer: 'Answer: ',
    playAgain: 'Play Again',
    estimatedScore: 'Est. Score',
  },
} as const

export function useI18n() {
  const t = computed(() => messages[currentLang.value])

  function toggleLang() {
    currentLang.value = currentLang.value === 'zh' ? 'en' : 'zh'
    localStorage.setItem('lang', currentLang.value)
  }

  return { lang: currentLang, t, toggleLang }
}
