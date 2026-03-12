import type { DayCell } from "../classes/CalendarClass";
import type { CalendarEvent } from "../classes/CalendarClass";

export function sameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function startOf(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function formatTime(date: Date): string {
  let h = date.getHours();
  const min = date.getMinutes();
  const ap = h >= 12 ? "PM" : "AM";
  h = h % 12 || 12;
  return `${h}:${String(min).padStart(2, "0")} ${ap}`;
}

export function getCalendarCells(year: number, month: number): DayCell[] {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const prevDays = new Date(year, month, 0).getDate();
  const cells: DayCell[] = [];

  for (let i = firstDay - 1; i >= 0; i--)
    cells.push({
      date: new Date(year, month - 1, prevDays - i),
      currentMonth: false,
    });

  for (let d = 1; d <= daysInMonth; d++)
    cells.push({ date: new Date(year, month, d), currentMonth: true });

  while (cells.length % 7 !== 0) {
    const extra = cells.length - daysInMonth - firstDay + 1;
    cells.push({ date: new Date(year, month + 1, extra), currentMonth: false });
  }
  return cells;
}

export function getEventsForDay(
  events: CalendarEvent[],
  date: Date,
): CalendarEvent[] {
  return events
    .filter((ev) => sameDay(ev.start, date))
    .sort((a, b) => {
      if (a.allDay && !b.allDay) return -1;
      if (!a.allDay && b.allDay) return 1;
      return a.start.getTime() - b.start.getTime();
    });
}

export function getMonthEventDays(
  events: CalendarEvent[],
  year: number,
  month: number,
): Date[] {
  const seen = new Set<number>();
  const days: Date[] = [];
  events.forEach((ev) => {
    if (ev.start.getFullYear() === year && ev.start.getMonth() === month) {
      const key = ev.start.getDate();
      if (!seen.has(key)) {
        seen.add(key);
        days.push(startOf(ev.start));
      }
    }
  });
  return days.sort((a, b) => a.getTime() - b.getTime());
}

export function toDateInput(date: Date): string {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
}

export function toTimeInput(date: Date): string {
  return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}

export function parseDateTime(dateStr: string, timeStr: string): Date {
  const [y, mo, d] = dateStr.split("-").map(Number);
  const [h, min] = timeStr.split(":").map(Number);
  return new Date(y, mo - 1, d, h, min);
}
