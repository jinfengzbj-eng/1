const display = document.getElementById('display');
const keys = document.querySelector('.keys');

let current = '0';
let resetOnNextDigit = false;

function sanitizeExpression(expression) {
  return expression.replace(/×/g, '*').replace(/÷/g, '/').replace(/−/g, '-');
}

function isValidInput(expression) {
  return /^[0-9+\-*/.()\s]+$/.test(expression);
}

function evaluateExpression(expression) {
  const cleaned = sanitizeExpression(expression);

  if (!isValidInput(cleaned)) {
    throw new Error('非法输入');
  }

  // eslint-disable-next-line no-new-func
  const result = Function(`"use strict"; return (${cleaned})`)();

  if (!Number.isFinite(result)) {
    throw new Error('结果无效');
  }

  return String(result);
}

function updateDisplay(value) {
  display.value = value;
}

function appendValue(value) {
  if (resetOnNextDigit) {
    current = value === '.' ? '0.' : value;
    resetOnNextDigit = false;
    updateDisplay(current);
    return;
  }

  if (value === '.') {
    const lastSegment = current.split(/[+\-*/]/).pop();
    if (lastSegment.includes('.')) {
      return;
    }
  }

  if (current === '0' && value !== '.') {
    current = value;
  } else {
    current += value;
  }

  updateDisplay(current);
}

function clearAll() {
  current = '0';
  resetOnNextDigit = false;
  updateDisplay(current);
}

function deleteOne() {
  if (resetOnNextDigit) {
    clearAll();
    return;
  }

  current = current.length > 1 ? current.slice(0, -1) : '0';
  updateDisplay(current);
}

function calculate() {
  try {
    const result = evaluateExpression(current);
    current = result;
    resetOnNextDigit = true;
    updateDisplay(current);
  } catch {
    current = '错误';
    resetOnNextDigit = true;
    updateDisplay(current);
  }
}

keys.addEventListener('click', (event) => {
  const button = event.target.closest('button');
  if (!button) return;

  const { action, value } = button.dataset;

  if (action === 'clear') {
    clearAll();
    return;
  }

  if (action === 'delete') {
    deleteOne();
    return;
  }

  if (action === 'equals') {
    calculate();
    return;
  }

  if (value) {
    if (current === '错误') {
      current = '0';
    }
    appendValue(value);
  }
});

window.addEventListener('keydown', (event) => {
  const key = event.key;

  if (/^[0-9.+\-*/]$/.test(key)) {
    if (current === '错误') {
      current = '0';
    }
    appendValue(key);
    return;
  }

  if (key === 'Enter' || key === '=') {
    event.preventDefault();
    calculate();
    return;
  }

  if (key === 'Backspace') {
    deleteOne();
    return;
  }

  if (key === 'Escape') {
    clearAll();
  }
});
