import { useMemo } from 'react';

interface PeriodPickerProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

const currentYear = new Date().getFullYear();
const YEAR_RANGE_START = 1980;
const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1);

function daysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

export default function PeriodPicker({ value, onChange, className = '' }: PeriodPickerProps) {
  const [year, month, day] = useMemo(() => {
    if (!value || value.length < 10) return [currentYear, 1, 1];
    const parts = value.split('-');
    return [parseInt(parts[0]) || currentYear, parseInt(parts[1]) || 1, parseInt(parts[2]) || 1];
  }, [value]);

  const years = useMemo(() => {
    const arr = [];
    for (let y = currentYear; y >= YEAR_RANGE_START; y--) {
      arr.push(y);
    }
    return arr;
  }, []);

  const days = useMemo(() => daysInMonth(year, month), [year, month]);

  const update = (y: number, m: number, d: number) => {
    const yy = String(y).padStart(4, '0');
    const mm = String(m).padStart(2, '0');
    const dd = String(Math.min(d, daysInMonth(y, m))).padStart(2, '0');
    onChange(`${yy}-${mm}-${dd}`);
  };

  const baseSelect =
    'appearance-none h-10 px-2 text-sm border border-gray-200 rounded-lg bg-white text-wechat-text text-center outline-none focus:border-wechat-green';

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <select
        value={year}
        onChange={(e) => update(parseInt(e.target.value), month, day)}
        className={baseSelect}
        style={{ minWidth: '4.5rem' }}
      >
        {years.map((y) => (
          <option key={y} value={y}>{y}年</option>
        ))}
      </select>
      <select
        value={month}
        onChange={(e) => update(year, parseInt(e.target.value), day)}
        className={baseSelect}
        style={{ minWidth: '3rem' }}
      >
        {MONTHS.map((m) => (
          <option key={m} value={m}>{m}月</option>
        ))}
      </select>
      <select
        value={day}
        onChange={(e) => update(year, month, parseInt(e.target.value))}
        className={baseSelect}
        style={{ minWidth: '3rem' }}
      >
        {Array.from({ length: days }, (_, i) => i + 1).map((d) => (
          <option key={d} value={d}>{d}日</option>
        ))}
      </select>
    </div>
  );
}
