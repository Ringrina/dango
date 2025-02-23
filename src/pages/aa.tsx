import React, { useState, useEffect } from 'react';
import { Plus, Minus } from 'lucide-react';

const TimeTracker = () => {
  const [workStart, setWorkStart] = useState('');
  const [workEnd, setWorkEnd] = useState('');
  const [breaks, setBreaks] = useState([{ start: '', end: '' }]);
  const [totalWorkTime, setTotalWorkTime] = useState('');
  const [errors, setErrors] = useState([]);

  // 時間の妥当性チェック
  const isValidTime = (time) => {
    if (!time) return true;
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    return timeRegex.test(time);
  };

  // 休憩時間の追加
  const addBreak = () => {
    setBreaks([...breaks, { start: '', end: '' }]);
  };

  // 休憩時間の削除
  const removeBreak = (index) => {
    const newBreaks = breaks.filter((_, i) => i !== index);
    setBreaks(newBreaks);
  };

  // 休憩時間の更新
  const updateBreak = (index, field, value) => {
    const newBreaks = breaks.map((breakTime, i) => {
      if (i === index) {
        return { ...breakTime, [field]: value };
      }
      return breakTime;
    });
    setBreaks(newBreaks);
  };

  // 時間を分に変換
  const timeToMinutes = (time) => {
    if (!time || !isValidTime(time)) return 0;
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  };

  // 分を時間形式に変換
  const minutesToTime = (minutes) => {
    if (minutes === 0) return '';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
  };

  // 休憩時間の重複チェック
  const checkBreakOverlap = (breaks) => {
    const validBreaks = breaks.filter(
      break_ => break_.start && break_.end && 
      isValidTime(break_.start) && isValidTime(break_.end)
    );

    for (let i = 0; i < validBreaks.length; i++) {
      const break1Start = timeToMinutes(validBreaks[i].start);
      const break1End = timeToMinutes(validBreaks[i].end);
      
      for (let j = i + 1; j < validBreaks.length; j++) {
        const break2Start = timeToMinutes(validBreaks[j].start);
        const break2End = timeToMinutes(validBreaks[j].end);
        
        if (
          (break1Start <= break2Start && break2Start < break1End) ||
          (break2Start <= break1Start && break1Start < break2End)
        ) {
          return true; // 重複あり
        }
      }
    }
    return false; // 重複なし
  };

  // 総労働時間の計算
  useEffect(() => {
    const calculateTotalTime = () => {
      const newErrors = [];

      // 基本的な入力形式チェック
      if (workStart && !isValidTime(workStart)) {
        newErrors.push('勤務開始時間の形式が正しくありません');
      }
      if (workEnd && !isValidTime(workEnd)) {
        newErrors.push('勤務終了時間の形式が正しくありません');
      }

      // 勤務時間の開始・終了チェック
      if (workStart && workEnd && isValidTime(workStart) && isValidTime(workEnd)) {
        const startMinutes = timeToMinutes(workStart);
        const endMinutes = timeToMinutes(workEnd);
        if (startMinutes >= endMinutes) {
          newErrors.push('勤務終了時間は開始時間より後に設定してください');
        }

        // 休憩時間のチェック
        if (checkBreakOverlap(breaks)) {
          newErrors.push('休憩時間が重複しています');
        }

        breaks.forEach((breakTime, index) => {
          if (breakTime.start && !isValidTime(breakTime.start)) {
            newErrors.push(`休憩${index + 1}の開始時間の形式が正しくありません`);
          }
          if (breakTime.end && !isValidTime(breakTime.end)) {
            newErrors.push(`休憩${index + 1}の終了時間の形式が正しくありません`);
          }

          if (breakTime.start && breakTime.end && 
              isValidTime(breakTime.start) && isValidTime(breakTime.end)) {
            
            const breakStartMinutes = timeToMinutes(breakTime.start);
            const breakEndMinutes = timeToMinutes(breakTime.end);

            // 休憩時間の順序チェック
            if (breakEndMinutes <= breakStartMinutes) {
              newErrors.push(`休憩${index + 1}の終了時間は開始時間より後に設定してください`);
            }

            // 休憩時間が勤務時間内かチェック
            if (breakStartMinutes < startMinutes) {
              newErrors.push(`休憩${index + 1}の開始時間（${breakTime.start}）が勤務開始時間（${workStart}）より前になっています`);
            }
            if (breakStartMinutes > endMinutes) {
              newErrors.push(`休憩${index + 1}の開始時間（${breakTime.start}）が勤務終了時間（${workEnd}）より後になっています`);
            }
            if (breakEndMinutes < startMinutes) {
              newErrors.push(`休憩${index + 1}の終了時間（${breakTime.end}）が勤務開始時間（${workStart}）より前になっています`);
            }
            if (breakEndMinutes > endMinutes) {
              newErrors.push(`休憩${index + 1}の終了時間（${breakTime.end}）が勤務終了時間（${workEnd}）より後になっています`);
            }
          }
        });
      }

      setErrors(newErrors);

      // エラーがある場合は計算しない
      if (newErrors.length > 0) {
        setTotalWorkTime('');
        return;
      }

      // 労働時間の計算
      if (workStart && workEnd && isValidTime(workStart) && isValidTime(workEnd)) {
        let totalMinutes = timeToMinutes(workEnd) - timeToMinutes(workStart);
        
        // 休憩時間の計算
        const breakMinutes = breaks.reduce((total, breakTime) => {
          if (breakTime.start && breakTime.end &&
              isValidTime(breakTime.start) && isValidTime(breakTime.end)) {
            return total + (timeToMinutes(breakTime.end) - timeToMinutes(breakTime.start));
          }
          return total;
        }, 0);

        // 総労働時間の計算
        const finalMinutes = totalMinutes - breakMinutes;
        if (finalMinutes >= 0) {
          setTotalWorkTime(minutesToTime(finalMinutes));
        } else {
          setTotalWorkTime('');
          setErrors(['休憩時間が勤務時間を超えています']);
        }
      } else {
        setTotalWorkTime('');
      }
    };

    calculateTotalTime();
  }, [workStart, workEnd, breaks]);

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h1 className="text-2xl font-bold mb-6">勤怠入力ツール</h1>
      
      <div className="space-y-6">
        {/* 勤務時間入力 */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              勤務開始時間
            </label>
            <input
              type="text"
              placeholder="HH:MM"
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
              value={workStart}
              onChange={(e) => setWorkStart(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              勤務終了時間
            </label>
            <input
              type="text"
              placeholder="HH:MM"
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
              value={workEnd}
              onChange={(e) => setWorkEnd(e.target.value)}
            />
          </div>
        </div>

        {/* 休憩時間入力 */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-medium">休憩時間</h2>
            <button
              onClick={addBreak}
              className="flex items-center px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              <Plus size={16} className="mr-1" />
              追加
            </button>
          </div>
          
          {breaks.map((breakTime, index) => (
            <div key={index} className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <input
                  type="text"
                  placeholder="開始 HH:MM"
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                  value={breakTime.start}
                  onChange={(e) => updateBreak(index, 'start', e.target.value)}
                />
              </div>
              <div className="flex items-start gap-2">
                <input
                  type="text"
                  placeholder="終了 HH:MM"
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                  value={breakTime.end}
                  onChange={(e) => updateBreak(index, 'end', e.target.value)}
                />
                {breaks.length > 1 && (
                  <button
                    onClick={() => removeBreak(index)}
                    className="p-2 text-red-500 hover:text-red-700"
                  >
                    <Minus size={20} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* エラーメッセージ表示 */}
        {errors.length > 0 && (
          <div className="bg-red-50 p-4 rounded">
            <h3 className="text-red-800 font-medium mb-2">入力エラー</h3>
            <ul className="list-disc list-inside space-y-1">
              {errors.map((error, index) => (
                <li key={index} className="text-red-700">{error}</li>
              ))}
            </ul>
          </div>
        )}

        {/* 総労働時間表示 */}
        <div className="mt-6 p-4 bg-gray-50 rounded">
          <h3 className="text-lg font-medium mb-2">総労働時間</h3>
          <p className="text-2xl font-bold">{totalWorkTime || '-- : --'}</p>
        </div>
      </div>
    </div>
  );
};

export default TimeTracker;