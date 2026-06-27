'use client';

import { useState } from 'react';
import { CalendarIcon, X, ChevronUp, ChevronDown, Clock } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface DateTimePickerProps {
  value: string;        // "YYYY-MM-DDTHH:mm" local time, or "" (dateOnly: "YYYY-MM-DD")
  onChange: (v: string) => void;
  placeholder?: string;
  disabled?: boolean;
  error?: boolean;
  dateOnly?: boolean;
}

function pad(n: number) {
  return String(n).padStart(2, '0');
}

// Parse "YYYY-MM-DDTHH:mm" or "YYYY-MM-DD" without UTC conversion so timezone never shifts the date
function parseValue(val: string, dateOnly?: boolean): { date: Date | undefined; hour: number; minute: number } {
  if (!val) return { date: undefined, hour: 9, minute: 0 };
  const datePart = dateOnly ? val : val.split('T')[0];
  if (!datePart) return { date: undefined, hour: 9, minute: 0 };
  const [y, mo, d] = datePart.split('-').map(Number);
  if (!y || !mo || !d) return { date: undefined, hour: 9, minute: 0 };
  if (dateOnly) return { date: new Date(y, mo - 1, d), hour: 0, minute: 0 };
  const timePart = val.split('T')[1];
  const [h = 9, m = 0] = (timePart ?? '09:00').split(':').map(Number);
  return { date: new Date(y, mo - 1, d), hour: h, minute: m };
}

function buildValue(date: Date, hour: number, minute: number): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(hour)}:${pad(minute)}`;
}

function buildDateValue(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function formatDisplay(val: string, dateOnly?: boolean): string {
  if (!val) return '';
  const { date, hour, minute } = parseValue(val, dateOnly);
  if (!date) return '';
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  if (dateOnly) return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
  return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()} · ${pad(hour)}:${pad(minute)}`;
}

function SpinField({
  label,
  value,
  max,
  onChange,
}: {
  label: string;
  value: number;
  max: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex flex-col items-center gap-0.5">
      <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">{label}</span>
      <div className="flex items-center gap-0.5">
        <button
          type="button"
          aria-label={`Decrease ${label}`}
          onClick={() => onChange((value + max) % (max + 1))}
          className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <ChevronDown size={13} />
        </button>
        <input
          type="number"
          aria-label={label}
          value={pad(value)}
          min={0}
          max={max}
          onChange={e => {
            const n = parseInt(e.target.value, 10);
            if (!isNaN(n) && n >= 0 && n <= max) onChange(n);
          }}
          className="w-10 border-b border-border bg-transparent py-0.5 text-center font-mono text-sm font-semibold text-foreground outline-none transition-colors focus:border-blue-500"
        />
        <button
          type="button"
          aria-label={`Increase ${label}`}
          onClick={() => onChange((value + 1) % (max + 1))}
          className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <ChevronUp size={13} />
        </button>
      </div>
    </div>
  );
}

export function DateTimePicker({
  value,
  onChange,
  placeholder,
  disabled,
  error,
  dateOnly,
}: DateTimePickerProps) {
  const defaultPlaceholder = dateOnly ? 'Pick date' : 'Pick date & time';
  const [open, setOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [hour, setHour] = useState(9);
  const [minute, setMinute] = useState(0);

  function handleOpenChange(o: boolean) {
    if (o) {
      const p = parseValue(value, dateOnly);
      setSelectedDate(p.date);
      setHour(p.hour);
      setMinute(p.minute);
    }
    setOpen(o);
  }

  function handleDaySelect(day: Date | undefined) {
    setSelectedDate(day);
    if (dateOnly) {
      if (day) { onChange(buildDateValue(day)); setOpen(false); }
      return;
    }
    // If editing an existing value (time already set), auto-close with the updated date
    if (day && value) {
      onChange(buildValue(day, hour, minute));
      setOpen(false);
    }
  }

  function apply() {
    if (selectedDate) onChange(buildValue(selectedDate, hour, minute));
    setOpen(false);
  }

  function clearValue(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    onChange('');
  }

  const display = formatDisplay(value, dateOnly);

  return (
    <div className="relative">
      <Popover open={open} onOpenChange={(o: boolean) => handleOpenChange(o)}>
        <PopoverTrigger
          disabled={disabled}
          render={
            <button
              type="button"
              disabled={disabled}
              className={[
                'flex w-full items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors',
                'bg-background focus:outline-none focus:ring-2 focus:ring-blue-500',
                'disabled:cursor-not-allowed disabled:opacity-50',
                error ? 'border-red-400' : 'border-border hover:border-ring',
                display ? 'text-foreground' : 'text-muted-foreground',
              ].join(' ')}
            >
              <CalendarIcon size={15} className="shrink-0 text-muted-foreground" />
              <span className="flex-1 text-left">{display || placeholder || defaultPlaceholder}</span>
            </button>
          }
        />
        <PopoverContent align="start" side="bottom" className="w-auto overflow-hidden p-0">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={handleDaySelect}
            defaultMonth={selectedDate ?? new Date()}
            autoFocus
          />
          {!dateOnly && (
            <div className="border-t border-border bg-muted/30 px-4 py-3">
              <div className="flex items-center gap-3">
                <Clock size={14} className="shrink-0 text-muted-foreground" />
                <div className="flex items-center gap-1.5">
                  <SpinField label="HH" value={hour} max={23} onChange={setHour} />
                  <span className="pb-1 text-base font-bold text-muted-foreground">:</span>
                  <SpinField label="MM" value={minute} max={59} onChange={setMinute} />
                </div>
                <button
                  type="button"
                  onClick={apply}
                  disabled={!selectedDate}
                  className="ml-auto rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-blue-700 disabled:opacity-40"
                >
                  Done
                </button>
              </div>
            </div>
          )}
        </PopoverContent>
      </Popover>

      {/* Clear button is absolute-positioned outside the trigger to avoid nested click conflict */}
      {value && !disabled && (
        <button
          type="button"
          aria-label={dateOnly ? 'Clear date' : 'Clear date and time'}
          onClick={clearValue}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
}
