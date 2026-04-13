/**
 * 24点求解器 — 分治法
 * 从 n 个数中任取两个，执行四则运算后放回，递归直到只剩一个数
 */

const TARGET = 24
const EPSILON = 1e-9

interface SolveResult {
  solvable: boolean
  formula: string
}

interface NumExpr {
  value: number
  expr: string
}

function applyOp(a: NumExpr, b: NumExpr, op: string): NumExpr | null {
  let value: number
  let expr: string

  switch (op) {
    case '+':
      value = a.value + b.value
      expr = `${a.expr}+${b.expr}`
      break
    case '-':
      value = a.value - b.value
      expr = `${a.expr}-${b.expr}`
      break
    case '*':
      value = a.value * b.value
      expr = `${wrapIfNeeded(a, '*')}*${wrapIfNeeded(b, '*')}`
      break
    case '/':
      if (Math.abs(b.value) < EPSILON) return null
      value = a.value / b.value
      expr = `${wrapIfNeeded(a, '*')}/${wrapDiv(b)}`
      break
    default:
      return null
  }

  return { value, expr }
}

/** Wrap expression in parentheses if it contains + or - (for * and / precedence) */
function wrapIfNeeded(n: NumExpr, _context: string): string {
  if (n.expr.match(/[+\-]/) && n.expr.length > String(n.value).length) {
    return `(${n.expr})`
  }
  return n.expr
}

/** Wrap divisor: needs parens if it contains any operator */
function wrapDiv(n: NumExpr): string {
  if (n.expr.match(/[+\-*/]/) && n.expr.length > String(n.value).length) {
    return `(${n.expr})`
  }
  return n.expr
}

function solve(nums: NumExpr[]): string | null {
  if (nums.length === 1) {
    if (Math.abs(nums[0].value - TARGET) < EPSILON) {
      return nums[0].expr
    }
    return null
  }

  // Pick two numbers
  for (let i = 0; i < nums.length; i++) {
    for (let j = 0; j < nums.length; j++) {
      if (i === j) continue

      const rest: NumExpr[] = []
      for (let k = 0; k < nums.length; k++) {
        if (k !== i && k !== j) rest.push(nums[k])
      }

      const ops = ['+', '-', '*', '/']
      for (const op of ops) {
        const result = applyOp(nums[i], nums[j], op)
        if (result === null) continue

        rest.push(result)
        const formula = solve(rest)
        if (formula !== null) return formula
        rest.pop()
      }
    }
  }

  return null
}

/**
 * Check if the given 4 numbers can make 24 and return the formula
 */
export function solve24(numbers: number[]): SolveResult {
  const nums: NumExpr[] = numbers.map(n => ({ value: n, expr: String(n) }))
  const formula = solve(nums)
  return {
    solvable: formula !== null,
    formula: formula ? `${formula}=24` : ''
  }
}

/**
 * Safe expression evaluator for the player's current formula
 * Supports: numbers, +, -, *, /, parentheses
 */
export function safeEval(numbers: number[], operators: string[], bracketMode: number): number | null {
  const a = numbers[0], b = numbers[1], c = numbers[2], d = numbers[3]
  const [op1, op2, op3] = operators

  const calc = (x: number, op: string, y: number): number | null => {
    switch (op) {
      case '+': return x + y
      case '-': return x - y
      case '*': return x * y
      case '/': return Math.abs(y) < EPSILON ? null : x / y
      default: return null
    }
  }

  // Helper: is this operator high precedence (* or /)
  const isHigh = (op: string) => op === '*' || op === '/'

  let result: number | null = null

  switch (bracketMode) {
    case 0: {
      // Standard operator precedence (no explicit brackets)
      // Evaluate * and / before + and -
      // Expression: a op1 b op2 c op3 d
      // We need to respect precedence: first do all * /, then + -
      // Build a value stack respecting precedence
      const ops: string[] = [op1, op2, op3]
      const nums: number[] = [b, c, d]

      // First pass: evaluate * and / immediately
      const pendingValues: number[] = [a]
      const pendingOps: string[] = []

      for (let i = 0; i < 3; i++) {
        if (isHigh(ops[i])) {
          const left = pendingValues.pop()!
          const r = calc(left, ops[i], nums[i])
          if (r === null) return null
          pendingValues.push(r)
        } else {
          pendingOps.push(ops[i])
          pendingValues.push(nums[i])
        }
      }

      // Second pass: evaluate remaining + and -
      result = pendingValues[0]
      for (let i = 0; i < pendingOps.length; i++) {
        result = calc(result!, pendingOps[i], pendingValues[i + 1])
        if (result === null) return null
      }
      break
    }
    case 1: {
      // (a○(b○c))○d
      const r1 = calc(b, op2, c)
      if (r1 === null) return null
      const r2 = calc(a, op1, r1)
      if (r2 === null) return null
      result = calc(r2, op3, d)
      break
    }
    case 2: {
      // (a○b)○(c○d)
      const r1 = calc(a, op1, b)
      if (r1 === null) return null
      const r2 = calc(c, op3, d)
      if (r2 === null) return null
      result = calc(r1, op2, r2)
      break
    }
    case 3: {
      // a○((b○c)○d)
      const r1 = calc(b, op2, c)
      if (r1 === null) return null
      const r2 = calc(r1, op3, d)
      if (r2 === null) return null
      result = calc(a, op1, r2)
      break
    }
    case 4: {
      // a○(b○(c○d))
      const r1 = calc(c, op3, d)
      if (r1 === null) return null
      const r2 = calc(b, op2, r1)
      if (r2 === null) return null
      result = calc(a, op1, r2)
      break
    }
    default:
      return null
  }

  return result
}

/**
 * Format the player's current expression as a readable string
 */
export function formatFormula(numbers: number[], operators: string[], bracketMode: number): string {
  const [a, b, c, d] = numbers.map(String)
  const [o1, o2, o3] = operators

  switch (bracketMode) {
    case 0: return `${a} ${o1} ${b} ${o2} ${c} ${o3} ${d}`
    case 1: return `(${a}${o1}(${b}${o2}${c}))${o3}${d}`
    case 2: return `(${a}${o1}${b})${o2}(${c}${o3}${d})`
    case 3: return `${a}${o1}((${b}${o2}${c})${o3}${d})`
    case 4: return `${a}${o1}(${b}${o2}(${c}${o3}${d}))`
    default: return ''
  }
}

/** Generate bracket mode labels based on current numbers and operators */
export function getBracketLabels(numbers: number[], operators: string[]): string[] {
  const [a, b, c, d] = numbers
  const [o1, o2, o3] = operators
  return [
    '',
    `(${a}${o1}(${b}${o2}${c}))${o3}${d}`,
    `(${a}${o1}${b})${o2}(${c}${o3}${d})`,
    `${a}${o1}((${b}${o2}${c})${o3}${d})`,
    `${a}${o1}(${b}${o2}(${c}${o3}${d}))`,
  ]
}
