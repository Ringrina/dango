import React, { useState } from 'react';

const Calculator = () => {
  const [display, setDisplay] = useState('0');
  const [firstOperand, setFirstOperand] = useState(null);
  const [operator, setOperator] = useState(null);
  const [waitingForSecondOperand, setWaitingForSecondOperand] = useState(false);
  const [hasSecondOperand, setHasSecondOperand] = useState(false);

  const calculate = (first, second, operator) => {
    const a = parseFloat(first);
    const b = parseFloat(second);
    
    let result;
    switch (operator) {
      case '+':
        result = a + b;
        break;
      case '-':
        result = a - b;
        break;
      case '*':
        result = a * b;
        break;
      case '/':
        if (b === 0) return 'Error';
        result = a / b;
        break;
      default:
        return second;
    }
    
    // 計算結果を10桁の精度で丸めて、不要な末尾の0を削除
    return Number(result.toFixed(10)).toString();
  };

  const handleNumber = (num) => {
    if (waitingForSecondOperand) {
      setDisplay(String(num));
      setWaitingForSecondOperand(false);
      setHasSecondOperand(true);
    } else {
      setDisplay(display === '0' ? String(num) : display + num);
      if (operator) {
        setHasSecondOperand(true);
      }
    }
  };

  const handleOperator = (nextOperator) => {
    const inputValue = display;

    if (firstOperand === null) {
      setFirstOperand(inputValue);
    } else if (operator && hasSecondOperand) {
      const result = calculate(firstOperand, inputValue, operator);
      setDisplay(result);
      setFirstOperand(result);
    }

    setWaitingForSecondOperand(true);
    setHasSecondOperand(false);
    setOperator(nextOperator);
  };

  const handleEqual = () => {
    // 演算子がない場合や、最初のオペランドがない場合は何もしない
    if (!operator || firstOperand === null) {
      return;
    }
    
    // 二項目が入力されていない場合は何もしない
    if (!hasSecondOperand) {
      return;
    }

    const result = calculate(firstOperand, display, operator);
    setDisplay(result);
    setFirstOperand(null);
    setOperator(null);
    setWaitingForSecondOperand(false);
    setHasSecondOperand(false);
  };

  const handleDecimal = () => {
    if (waitingForSecondOperand) {
      setDisplay('0.');
      setWaitingForSecondOperand(false);
      return;
    }

    if (!display.includes('.')) {
      setDisplay(display + '.');
    }
  };

  const clear = () => {
    setDisplay('0');
    setFirstOperand(null);
    setOperator(null);
    setWaitingForSecondOperand(false);
    setHasSecondOperand(false);
  };

  const Button = ({ children, onClick, className = '' }) => (
    <button
      onClick={onClick}
      className={`p-4 text-xl font-bold rounded-lg shadow hover:opacity-80 transition-opacity ${className}`}
    >
      {children}
    </button>
  );

  const displayFormula = () => {
    if (firstOperand === null) return '';
    return `${firstOperand} ${operator || ''} `;
  };

  return (
    <div className="max-w-sm mx-auto my-8">
      <div className="bg-gray-800 p-6 rounded-xl shadow-xl">
        <div className="mb-4">
          <div className="text-sm text-gray-400 text-right h-6 overflow-hidden">
            {displayFormula()}
          </div>
          <div className="bg-gray-700 p-4 rounded-lg">
            <div className="text-right text-white text-3xl font-mono overflow-hidden">
              {display}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-2">
          {/* First row */}
          <Button onClick={clear} className="bg-red-500 text-white col-span-2">
            C
          </Button>
          <Button onClick={() => handleOperator('/')} className="bg-yellow-500">
            ÷
          </Button>
          <Button onClick={() => handleOperator('*')} className="bg-yellow-500">
            ×
          </Button>

          {/* Number pad */}
          <Button onClick={() => handleNumber('7')} className="bg-gray-600 text-white">
            7
          </Button>
          <Button onClick={() => handleNumber('8')} className="bg-gray-600 text-white">
            8
          </Button>
          <Button onClick={() => handleNumber('9')} className="bg-gray-600 text-white">
            9
          </Button>
          <Button onClick={() => handleOperator('-')} className="bg-yellow-500">
            -
          </Button>

          <Button onClick={() => handleNumber('4')} className="bg-gray-600 text-white">
            4
          </Button>
          <Button onClick={() => handleNumber('5')} className="bg-gray-600 text-white">
            5
          </Button>
          <Button onClick={() => handleNumber('6')} className="bg-gray-600 text-white">
            6
          </Button>
          <Button onClick={() => handleOperator('+')} className="bg-yellow-500">
            +
          </Button>

          <Button onClick={() => handleNumber('1')} className="bg-gray-600 text-white">
            1
          </Button>
          <Button onClick={() => handleNumber('2')} className="bg-gray-600 text-white">
            2
          </Button>
          <Button onClick={() => handleNumber('3')} className="bg-gray-600 text-white">
            3
          </Button>
          <Button onClick={handleEqual} className="bg-blue-500 text-white row-span-2">
            =
          </Button>

          <Button onClick={() => handleNumber('0')} className="bg-gray-600 text-white col-span-2">
            0
          </Button>
          <Button onClick={handleDecimal} className="bg-gray-600 text-white">
            .
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Calculator;