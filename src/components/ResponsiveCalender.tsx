/**
 * MobiScrollCalendar.tsx
 * ──────────────────────
 * A pixel-perfect TypeScript React clone of Mobiscroll's Mobile Month View
 * with full responsive support for mobile AND desktop.
 *
 * Features
 * ─────────
 * • Fully typed with TypeScript interfaces
 * • Month grid with colored dot indicators (mobile) + event labels (desktop)
 * • Tap/click a day → agenda list filters to that day
 * • Prev / Next month navigation with slide animation
 * • Add / Edit / Delete events via bottom-sheet (mobile) or modal (desktop)
 * • Color picker, all-day toggle, date & time inputs
 * • Responsive: two-column sidebar layout on ≥768 px, stacked on mobile
 * • Touch-friendly tap targets, smooth CSS transitions
 * • Zero external dependencies — just React
 */

import React, {
  useState,
  useMemo,
  useCallback,
  useEffect,
  useRef,
  type FC,
} from "react";

/* ══════════════════════════════════════════════════════════════
   1. TYPES
══════════════════════════════════════════════════════════════ */
export interface CalendarEvent {
  id: number;
  title: string;
  start: Date;
  end: Date;
  color: string;
  allDay: boolean;
}

interface DayCell {
  date: Date;
  currentMonth: boolean;
}

type SheetMode = "add" | "edit" | "detail";
interface SheetState {
  mode: SheetMode;
  event?: CalendarEvent;
}

/* ══════════════════════════════════════════════════════════════
   2. CONSTANTS
══════════════════════════════════════════════════════════════ */
const MONTH_NAMES: string[] = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
const DAY_SHORT: string[] = ["S", "M", "T", "W", "T", "F", "S"];
const DAY_LONG: string[] = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

const COLOR_PALETTE: string[] = [
  "#3b82f6",
  "#8b5cf6",
  "#10b981",
  "#f59e0b",
  "#f43f5e",
  "#06b6d4",
  "#ec4899",
  "#84cc16",
];

/* ══════════════════════════════════════════════════════════════
   3. SEED DATA
══════════════════════════════════════════════════════════════ */
const NOW = new Date();
const CY = NOW.getFullYear();
const CM = NOW.getMonth();

let _uid = 1;
function mkEvent(
  title: string,
  mo: number,
  d: number,
  sh: number,
  sm: number,
  eh: number,
  em: number,
  color: string,
  allDay = false,
): CalendarEvent {
  return {
    id: _uid++,
    title,
    color,
    allDay,
    start: new Date(CY, mo, d, sh, sm),
    end: new Date(CY, mo, d, eh, em),
  };
}

const INITIAL_EVENTS: CalendarEvent[] = [
  mkEvent("Team Standup", CM, 1, 9, 0, 9, 30, "#3b82f6"),
  mkEvent("Design Review", CM, 3, 14, 0, 15, 30, "#8b5cf6"),
  mkEvent("Sprint Planning", CM, 3, 10, 0, 12, 0, "#f59e0b"),
  mkEvent("Client Discovery", CM, 5, 11, 0, 12, 0, "#10b981"),
  mkEvent("Lunch with Sam", CM, 5, 12, 30, 13, 30, "#f43f5e"),
  mkEvent("Product Demo", CM, 7, 15, 0, 16, 0, "#3b82f6"),
  mkEvent("All-Hands Meeting", CM, 10, 10, 0, 11, 0, "#8b5cf6"),
  mkEvent("OKR Review", CM, 10, 14, 0, 15, 0, "#f59e0b"),
  mkEvent("Interview Loop", CM, 12, 9, 0, 13, 0, "#10b981"),
  mkEvent("Tech Talk", CM, 14, 16, 0, 17, 30, "#3b82f6"),
  mkEvent("Board Prep", CM, 16, 9, 0, 10, 0, "#f43f5e"),
  mkEvent("Q2 Planning", CM, 17, 13, 0, 15, 0, "#8b5cf6"),
  mkEvent("Team Offsite", CM, 20, 0, 0, 23, 59, "#f59e0b", true),
  mkEvent("Team Offsite", CM, 21, 0, 0, 23, 59, "#f59e0b", true),
  mkEvent("Retrospective", CM, 24, 15, 0, 16, 0, "#10b981"),
  mkEvent("Lunch & Learn", CM, 24, 12, 0, 13, 0, "#3b82f6"),
  mkEvent("Release Day", CM, 28, 0, 0, 23, 59, "#f43f5e", true),
  mkEvent("1-on-1", CM, NOW.getDate(), 10, 0, 10, 30, "#3b82f6"),
  mkEvent("Morning Run", CM, NOW.getDate(), 7, 0, 8, 0, "#10b981"),
];

/* ══════════════════════════════════════════════════════════════
   4. UTILITIES
══════════════════════════════════════════════════════════════ */
function sameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function startOf(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function formatTime(date: Date): string {
  let h = date.getHours();
  const min = date.getMinutes();
  const ap = h >= 12 ? "PM" : "AM";
  h = h % 12 || 12;
  return `${h}:${String(min).padStart(2, "0")} ${ap}`;
}

function getCalendarCells(year: number, month: number): DayCell[] {
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

function getEventsForDay(events: CalendarEvent[], date: Date): CalendarEvent[] {
  return events
    .filter((ev) => sameDay(ev.start, date))
    .sort((a, b) => {
      if (a.allDay && !b.allDay) return -1;
      if (!a.allDay && b.allDay) return 1;
      return a.start.getTime() - b.start.getTime();
    });
}

function getMonthEventDays(
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

function toDateInput(date: Date): string {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
}
function toTimeInput(date: Date): string {
  return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}
function parseDateTime(dateStr: string, timeStr: string): Date {
  const [y, mo, d] = dateStr.split("-").map(Number);
  const [h, min] = timeStr.split(":").map(Number);
  return new Date(y, mo - 1, d, h, min);
}

/* ══════════════════════════════════════════════════════════════
   5. GLOBAL STYLES (injected once via <style>)
══════════════════════════════════════════════════════════════ */
const GLOBAL_CSS = `
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&family=DM+Mono:wght@400;500&display=swap');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

:root {
  --accent:        #2563eb;
  --accent-light:  #eff6ff;
  --accent-medium: #bfdbfe;
  --accent-dark:   #1d4ed8;
  --danger:        #ef4444;
  --danger-light:  #fef2f2;
  --success:       #22c55e;
  --surface:       #ffffff;
  --surface-2:     #f8fafc;
  --surface-3:     #f1f5f9;
  --surface-4:     #e2e8f0;
  --border:        #e2e8f0;
  --border-strong: #cbd5e1;
  --text-1:        #0f172a;
  --text-2:        #334155;
  --text-3:        #64748b;
  --text-4:        #94a3b8;
  --text-5:        #cbd5e1;
  --radius-xs:     4px;
  --radius-sm:     8px;
  --radius-md:     12px;
  --radius-lg:     18px;
  --radius-xl:     24px;
  --shadow-xs:     0 1px 2px rgba(0,0,0,.05);
  --shadow-sm:     0 1px 6px rgba(0,0,0,.08);
  --shadow-md:     0 4px 20px rgba(0,0,0,.10);
  --shadow-lg:     0 12px 40px rgba(0,0,0,.14);
  --font-sans:     'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif;
  --font-mono:     'DM Mono', 'SF Mono', monospace;
  --transition:    .16s cubic-bezier(.4,0,.2,1);
}

html, body, #root {
  height: 100%;
  font-family: var(--font-sans);
  background: var(--surface-2);
  color: var(--text-1);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* ════════════════════════════════════════
   APP SHELL
════════════════════════════════════════ */
.app-shell {
  display: flex;
  flex-direction: column;
  height: 100dvh;
  overflow: hidden;
  background: var(--surface);
  margin-top: 50px;
  width:100%;
}

/* ════════════════════════════════════════
   TOPBAR
════════════════════════════════════════ */
.topbar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 16px;
  height: 58px;
  border-bottom: 1px solid var(--border);
  background: var(--surface);
  position: relative;
  z-index: 20;
  flex-shrink: 0;
}
.topbar-logo {
  display: flex; align-items: center; gap: 7px;
  font-size: 15px; font-weight: 700; color: var(--accent);
  letter-spacing: -0.3px; flex-shrink: 0;
  text-decoration: none;
}
.topbar-logo svg { flex-shrink: 0; }
.topbar-divider {
  width: 1px; height: 20px; background: var(--border);
  margin: 0 4px; flex-shrink: 0;
}
.topbar-nav {
  display: flex; align-items: center; gap: 4px;
}
.topbar-title {
  font-size: 16px; font-weight: 700;
  letter-spacing: -0.4px; color: var(--text-1);
  white-space: nowrap; min-width: 160px; text-align: center;
  padding: 0 4px;
}
.topbar-right {
  display: flex; align-items: center; gap: 8px; margin-left: auto;
}
.icon-btn {
  width: 32px; height: 32px; border-radius: 8px;
  border: none; background: transparent;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; color: var(--text-3);
  transition: background var(--transition), color var(--transition);
  flex-shrink: 0;
}
.icon-btn:hover  { background: var(--surface-3); color: var(--text-1); }
.icon-btn:active { background: var(--surface-4); }
.today-pill {
  height: 32px; padding: 0 12px;
  border: 1.5px solid var(--border); border-radius: 8px;
  background: var(--surface); font-family: var(--font-sans);
  font-size: 13px; font-weight: 600; color: var(--text-2);
  cursor: pointer; white-space: nowrap;
  transition: all var(--transition);
}
.today-pill:hover { border-color: var(--accent); color: var(--accent); background: var(--accent-light); }
.btn-add-desktop {
  height: 32px; padding: 0 14px;
  border: none; border-radius: 8px; background: var(--accent);
  font-family: var(--font-sans); font-size: 13px; font-weight: 600;
  color: #fff; cursor: pointer; display: flex; align-items: center; gap: 6px;
  transition: background var(--transition), transform var(--transition);
  flex-shrink: 0; white-space: nowrap;
}
.btn-add-desktop:hover  { background: var(--accent-dark); }
.btn-add-desktop:active { transform: scale(.97); }
.btn-add-mobile {
  width: 32px; height: 32px; border-radius: 50%;
  border: none; background: var(--accent);
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; color: #fff; flex-shrink: 0;
  transition: background var(--transition), transform var(--transition);
}
.btn-add-mobile:hover  { background: var(--accent-dark); }
.btn-add-mobile:active { transform: scale(.92); }
.event-count-badge {
  height: 24px; padding: 0 10px;
  background: var(--surface-3); border-radius: 20px;
  font-size: 12px; font-weight: 600; color: var(--text-3);
  display: flex; align-items: center; gap: 4px; white-space: nowrap;
}
.event-count-dot {
  width: 6px; height: 6px; border-radius: 50%; background: var(--accent);
}

/* ════════════════════════════════════════
   MAIN CONTENT AREA
════════════════════════════════════════ */
.main-content {
  display: flex;
  flex: 1;
  overflow: hidden;
}

/* ════════════════════════════════════════
   CALENDAR PANEL
════════════════════════════════════════ */
.calendar-panel {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: var(--surface);
}
.calendar-panel.mobile {
  width: 100%;
  border-bottom: 1px solid var(--border);
  flex-shrink: 0;
}
.calendar-panel.desktop {
  flex: 1;
  min-width: 0;
  border-right: 1px solid var(--border);
}

/* ════════════════════════════════════════
   MONTH GRID — SHARED
════════════════════════════════════════ */
.grid-overflow {
  overflow: hidden;
  display: flex;
  flex-direction: column;
}
.grid-slide {
  display: flex;
  flex-direction: column;
  flex: 1;
}
.grid-slide.slide-left  { animation: slideInLeft  .28s cubic-bezier(.4,0,.2,1); }
.grid-slide.slide-right { animation: slideInRight .28s cubic-bezier(.4,0,.2,1); }
@keyframes slideInLeft  { from { transform:translateX(24px); opacity:.4 } to { transform:translateX(0); opacity:1 } }
@keyframes slideInRight { from { transform:translateX(-24px); opacity:.4 } to { transform:translateX(0); opacity:1 } }

/* ── Mobile grid ── */
.weekday-row {
  display: grid; grid-template-columns: repeat(7,1fr);
}
.weekday-cell {
  text-align: center; font-size: 11px; font-weight: 700;
  color: var(--text-4); letter-spacing: .6px; text-transform: uppercase;
  padding: 10px 0 6px;
}
.days-grid {
  display: grid; grid-template-columns: repeat(7,1fr);
}

/* Mobile day cell */
.day-cell {
  display: flex; flex-direction: column; align-items: center; gap: 3px;
  padding: 4px 2px; cursor: pointer;
  transition: background var(--transition);
  -webkit-tap-highlight-color: transparent;
  user-select: none;
}
.day-cell:hover  { background: var(--surface-3); }
.day-cell:active { background: var(--surface-4); }
.day-cell.outside .day-num { color: var(--text-5); }
.day-cell.outside .day-dots { opacity: .3; }

.day-num {
  font-size: 15px; font-weight: 500; color: var(--text-1);
  width: 34px; height: 34px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  line-height: 1; transition: all var(--transition);
}
.day-cell.col-0 .day-num { color: var(--danger); }
.day-cell.col-6 .day-num { color: var(--accent); }
.day-cell.is-today .day-num {
  background: var(--accent) !important; color: #fff !important; font-weight: 700;
}
.day-cell.is-selected:not(.is-today) .day-num {
  background: var(--accent-light); color: var(--accent); font-weight: 700;
  box-shadow: 0 0 0 2px var(--accent-medium);
}

.day-dots { display: flex; gap: 2px; height: 5px; align-items: center; }
.day-dot  { width: 5px; height: 5px; border-radius: 50%; flex-shrink: 0; }

/* Desktop day label chips (used in mobile panel too, but hidden via JS) */
.day-labels { width: 100%; display: flex; flex-direction: column; gap: 2px; margin-top: 3px; }
.day-label {
  font-size: 11px; font-weight: 600; padding: 2px 6px; border-radius: var(--radius-xs);
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  width: 100%; line-height: 1.5; cursor: pointer;
  transition: filter var(--transition);
}
.day-label:hover { filter: brightness(.88); }
.day-more {
  font-size: 11px; color: var(--text-3); font-weight: 600; padding: 1px 6px;
  border-radius: var(--radius-xs); cursor: pointer; transition: all var(--transition);
  width: 100%;
}
.day-more:hover { background: var(--surface-3); color: var(--text-2); }

/* ════════════════════════════════════════
   AGENDA PANEL — SHARED
════════════════════════════════════════ */
.agenda-wrap {
  display: flex; flex-direction: column;
  overflow: hidden;
}
.agenda-panel {
  flex: 1; overflow-y: auto; background: var(--surface);
  -webkit-overflow-scrolling: touch; scroll-behavior: smooth;
}
.agenda-panel::-webkit-scrollbar { width: 4px; }
.agenda-panel::-webkit-scrollbar-thumb { background: var(--surface-4); border-radius: 2px; }
.agenda-panel:hover::-webkit-scrollbar-thumb { background: var(--border-strong); }

.agenda-empty {
  display: flex; flex-direction: column; align-items: center;
  justify-content: center; height: 100%; gap: 12px; color: var(--text-4);
  padding: 40px 20px;
}
.agenda-empty-icon {
  width: 52px; height: 52px; background: var(--surface-3);
  border-radius: 50%; display: flex; align-items: center; justify-content: center;
}
.agenda-empty-title { font-size: 14px; font-weight: 600; color: var(--text-3); }
.agenda-empty-sub   { font-size: 12px; color: var(--text-4); text-align: center; line-height: 1.5; }

/* Sidebar top panel — shows on desktop */
.agenda-sidebar-top {
  display: none;
}

.agenda-day-block { padding: 0 14px; }
.agenda-day-header {
  display: flex; align-items: flex-end; gap: 10px;
  padding: 16px 0 10px; border-bottom: 1px solid var(--border);
  margin-bottom: 10px; position: sticky; top: 0;
  background: var(--surface); z-index: 2;
}
.agenda-day-num {
  font-size: 34px; font-weight: 700; color: var(--text-1);
  line-height: 1; min-width: 40px;
}
.agenda-day-header.is-today .agenda-day-num  { color: var(--accent); }
.agenda-day-header.is-today .agenda-day-name { color: var(--accent); }
.agenda-day-meta { display: flex; flex-direction: column; padding-bottom: 4px; }
.agenda-day-name  { font-size: 14px; font-weight: 700; color: var(--text-2); }
.agenda-day-count { font-size: 11px; color: var(--text-4); margin-top: 2px; font-weight: 600; text-transform: uppercase; letter-spacing: .4px; }

/* ════════════════════════════════════════
   EVENT CARDS
════════════════════════════════════════ */
.event-card {
  display: flex; align-items: stretch; gap: 10px;
  padding: 10px 12px; border-radius: var(--radius-sm);
  margin-bottom: 6px; cursor: pointer;
  background: var(--surface); border: 1px solid var(--border);
  transition: all var(--transition);
  -webkit-tap-highlight-color: transparent;
}
.event-card:hover  { border-color: var(--border-strong); box-shadow: var(--shadow-sm); transform: translateY(-1px); }
.event-card:active { transform: scale(.99) translateY(0); }
.event-bar { width: 3px; border-radius: 3px; flex-shrink: 0; align-self: stretch; min-height: 32px; }
.event-body { flex: 1; min-width: 0; }
.event-title { font-size: 13px; font-weight: 600; color: var(--text-1); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.event-time  { font-size: 11px; color: var(--text-4); margin-top: 2px; font-weight: 500; font-family: var(--font-mono); }
.event-badge {
  font-size: 10px; font-weight: 700; padding: 2px 7px; border-radius: 20px;
  align-self: flex-start; letter-spacing: .3px; text-transform: uppercase; flex-shrink: 0; margin-top: 1px;
}

/* ════════════════════════════════════════
   OVERLAY / SHEET / MODAL
════════════════════════════════════════ */
.overlay {
  position: fixed; inset: 0; background: rgba(15,23,42,.5);
  z-index: 200; display: flex; align-items: flex-end; justify-content: center;
  animation: fadeIn .18s ease; backdrop-filter: blur(2px);
}
.overlay.modal-mode { align-items: center; }
@keyframes fadeIn { from { opacity:0 } to { opacity:1 } }

.sheet {
  background: var(--surface); border-radius: var(--radius-xl) var(--radius-xl) 0 0;
  width: 100%; max-width: 480px; padding-bottom: env(safe-area-inset-bottom, 16px);
  animation: slideUp .26s cubic-bezier(.4,0,.2,1);
  max-height: 92dvh; overflow-y: auto;
}
.modal {
  background: var(--surface); border-radius: var(--radius-lg);
  width: 460px; max-width: calc(100vw - 48px);
  padding-bottom: 24px; max-height: 90vh; overflow-y: auto;
  box-shadow: var(--shadow-lg);
  animation: popIn .22s cubic-bezier(.34,1.56,.64,1);
}
@keyframes slideUp { from { transform:translateY(100%) } to { transform:translateY(0) } }
@keyframes popIn   { from { transform:scale(.93); opacity:0 } to { transform:scale(1); opacity:1 } }

.sheet-handle {
  width: 32px; height: 4px; background: var(--surface-4);
  border-radius: 2px; margin: 10px auto 0;
}
.sheet-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 14px 20px 12px; border-bottom: 1px solid var(--border);
}
.sheet-title { font-size: 16px; font-weight: 700; color: var(--text-1); }
.close-btn {
  width: 28px; height: 28px; border-radius: 50%; border: none;
  background: var(--surface-3); display: flex; align-items: center;
  justify-content: center; cursor: pointer; color: var(--text-3);
  transition: background var(--transition);
}
.close-btn:hover { background: var(--surface-4); color: var(--text-1); }

.sheet-body { padding: 18px 20px; display: flex; flex-direction: column; gap: 16px; }

.field-label {
  font-size: 11px; font-weight: 700; color: var(--text-4);
  text-transform: uppercase; letter-spacing: .7px; margin-bottom: 6px;
}
.cal-input {
  width: 100%; height: 42px; border: 1.5px solid var(--border);
  border-radius: var(--radius-sm); padding: 0 12px;
  font-family: var(--font-sans); font-size: 14px; color: var(--text-1);
  background: var(--surface); outline: none; transition: border-color var(--transition);
  appearance: none; -webkit-appearance: none;
}
.cal-input:focus { border-color: var(--accent); box-shadow: 0 0 0 3px var(--accent-light); }

.row-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }

.color-picker { display: flex; gap: 8px; flex-wrap: wrap; }
.color-swatch {
  width: 30px; height: 30px; border-radius: 50%;
  border: 3px solid transparent; cursor: pointer;
  transition: all var(--transition); flex-shrink: 0;
}
.color-swatch.selected { border-color: var(--text-1); transform: scale(1.15); box-shadow: var(--shadow-sm); }

.toggle-row { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
.toggle-label { font-size: 14px; font-weight: 500; color: var(--text-1); }
.toggle-btn {
  width: 48px; height: 28px; background: var(--surface-4); border-radius: 20px;
  border: none; cursor: pointer; position: relative;
  transition: background .22s; flex-shrink: 0;
}
.toggle-btn.on { background: var(--success); }
.toggle-btn::after {
  content: ''; position: absolute;
  width: 24px; height: 24px; background: #fff; border-radius: 50%;
  top: 2px; left: 2px; box-shadow: 0 1px 3px rgba(0,0,0,.2);
  transition: transform .22s;
}
.toggle-btn.on::after { transform: translateX(20px); }

.sheet-footer { display: flex; gap: 8px; padding: 0 20px 4px; }
.btn {
  flex: 1; height: 46px; border-radius: var(--radius-sm); border: none;
  font-family: var(--font-sans); font-size: 14px; font-weight: 700;
  cursor: pointer; transition: all var(--transition);
}
.btn:active { transform: scale(.97); }
.btn-primary { background: var(--accent); color: #fff; }
.btn-primary:hover  { background: var(--accent-dark); }
.btn-ghost   { background: var(--surface-3); color: var(--text-2); }
.btn-ghost:hover   { background: var(--surface-4); }
.btn-danger  { background: var(--danger-light); color: var(--danger); flex: 0 0 auto; padding: 0 16px; }
.btn-danger:hover  { background: #fee2e2; }

.detail-color-strip { height: 4px; margin: 14px 20px 0; border-radius: 4px; }
.detail-title { font-size: 20px; font-weight: 700; padding: 12px 20px 4px; color: var(--text-1); }
.detail-time  { font-size: 13px; color: var(--text-3); padding: 0 20px 18px; font-family: var(--font-mono); font-weight: 500; }

/* ════════════════════════════════════════
   MOBILE LAYOUT  (< 768px)
════════════════════════════════════════ */
@media (max-width: 767px) {
  .calendar-panel.desktop { display: none; }
  .calendar-panel.mobile  { display: flex; }
  .main-content { flex-direction: column; }
  .agenda-wrap  { flex: 1; overflow: hidden; }
  .agenda-panel { padding-top: 4px; background: var(--surface-2); }
  .agenda-day-block { padding: 0 14px; }
  .event-card { background: var(--surface); }
  .desktop-only { display: none !important; }
  .mobile-hidden { display: none !important; }
  .topbar-logo span { display: none; }
  .event-count-badge { display: none; }
  .btn-add-desktop { display: none; }
}

/* ════════════════════════════════════════
   DESKTOP LAYOUT  (≥ 768px)
════════════════════════════════════════ */
@media (min-width: 768px) {
  /* ── App: full viewport, no artificial centering ── */
  .app-shell { background: var(--surface-2); }
  .topbar { padding: 0 24px; background: var(--surface); border-bottom: 1px solid var(--border); }

  .calendar-panel.mobile  { display: none; }
  .calendar-panel.desktop {
    display: flex;
    flex: 1;            /* ← Calendar takes all remaining space — the HERO */
    min-width: 0;
    border-right: 1px solid var(--border);
    background: var(--surface);
  }

  .main-content { flex-direction: row; }

  /* ── Grid fills the full panel height ── */
  .grid-overflow {
    flex: 1;
    overflow: hidden;
  }

  /* ── Weekday header: full-width with visible cell borders ── */
  .weekday-row {
    border-bottom: 1px solid var(--border);
    flex-shrink: 0;
    padding: 0;
  }
  .weekday-cell {
    padding: 10px 12px;
    text-align: left;
    font-size: 11px; font-weight: 700; letter-spacing: .6px;
    color: var(--text-4); text-transform: uppercase;
    border-right: 1px solid var(--border);
  }
  .weekday-cell:last-child { border-right: none; }
  .weekday-cell:first-child { color: var(--danger); }
  .weekday-cell:last-child  { color: var(--accent); }

  /* ── Days grid: fills height, equal rows ── */
  .days-grid {
    flex: 1;
    padding: 0;
    gap: 0;
    grid-auto-rows: minmax(100px, 1fr);  /* fills space, minimum 100px per row */
  }

  /* ── Day cells: left-aligned, visible grid-line borders ── */
  .day-cell {
    align-items: flex-start;
    padding: 8px 10px 6px;
    border-right: 1px solid var(--border);
    border-bottom: 1px solid var(--border);
    border-radius: 0;
    gap: 4px;
    overflow: hidden;
    position: relative;
  }
  .day-cell:nth-child(7n) { border-right: none; }
  .day-cell:hover { background: var(--surface-2); }
  .day-cell.outside { background: var(--surface-2); opacity: 1; }
  .day-cell.outside .day-num { color: var(--text-5); }
  .day-cell.outside .day-labels { opacity: .45; }

  /* Weekend column subtle tint */
  .day-cell.col-0 { background: rgba(239,68,68,.018); }
  .day-cell.col-6 { background: rgba(37,99,235,.018); }
  .day-cell.col-0:hover { background: rgba(239,68,68,.05); }
  .day-cell.col-6:hover { background: rgba(37,99,235,.05); }
  .day-cell.col-0.outside, .day-cell.col-6.outside { background: var(--surface-2); }

  /* Selected day: clear blue wash */
  .day-cell.is-selected {
    background: var(--accent-light) !important;
  }
  .day-cell.is-selected:hover { background: #dbeafe !important; }
  .day-cell.is-selected.col-0,
  .day-cell.is-selected.col-6 { background: var(--accent-light) !important; }

  /* Day number: top-left circle */
  .day-num {
    width: 28px; height: 28px; font-size: 13px; font-weight: 600;
    align-self: flex-start; flex-shrink: 0;
  }
  .day-cell.col-0 .day-num { color: var(--danger); }
  .day-cell.col-6 .day-num { color: var(--accent); }
  .day-cell.is-today .day-num {
    background: var(--accent) !important; color: #fff !important;
    font-weight: 700; box-shadow: 0 2px 8px rgba(37,99,235,.35);
  }
  .day-cell.is-selected:not(.is-today) .day-num {
    background: var(--accent); color: #fff; font-weight: 700;
    box-shadow: 0 2px 6px rgba(37,99,235,.3);
  }

  /* Event label chips */
  .day-labels { margin-top: 2px; gap: 2px; }
  .day-label {
    font-size: 11px; font-weight: 600; padding: 2px 7px;
    border-radius: 4px; line-height: 1.6; cursor: pointer;
  }
  .day-more {
    font-size: 11px; padding: 1px 7px; border-radius: 4px;
    color: var(--text-3); font-weight: 600;
  }
  .day-more:hover { background: var(--surface-3); color: var(--text-2); }

  /* ── Agenda wrap becomes a fixed right sidebar ── */
  .agenda-wrap {
    width: 300px;
    flex-shrink: 0;
    background: var(--surface);
    border-left: 1px solid var(--border);
    overflow: hidden;
  }

  /* Sidebar top info strip */
  .agenda-sidebar-top {
    display: flex;
    flex-direction: column;
    padding: 14px 16px 12px;
    border-bottom: 1px solid var(--border);
    background: var(--surface);
    flex-shrink: 0;
    gap: 4px;
  }
  .agenda-sidebar-label {
    font-size: 10px; font-weight: 700; letter-spacing: .8px;
    text-transform: uppercase; color: var(--text-4);
  }
  .agenda-sidebar-heading {
    font-size: 18px; font-weight: 700; color: var(--text-1); letter-spacing: -0.3px;
  }
  .agenda-sidebar-sub {
    font-size: 12px; color: var(--text-3); font-weight: 500;
  }
  .agenda-sidebar-clear {
    display: inline-flex; align-items: center; gap: 4px;
    margin-top: 6px; height: 26px; padding: 0 10px;
    border: 1px solid var(--border); border-radius: 6px;
    background: var(--surface); cursor: pointer;
    font-family: var(--font-sans); font-size: 11px; font-weight: 600;
    color: var(--text-3); transition: all var(--transition); width: fit-content;
  }
  .agenda-sidebar-clear:hover { border-color: var(--accent); color: var(--accent); background: var(--accent-light); }

  /* Agenda scrollable area */
  .agenda-panel {
    background: var(--surface);
    flex: 1;
  }

  /* Agenda day blocks - tighter on sidebar */
  .agenda-day-block { padding: 0 14px; }
  .agenda-day-num   { font-size: 28px; }
  .agenda-day-name  { font-size: 13px; }
  .agenda-day-header { padding: 14px 0 8px; margin-bottom: 8px; }

  /* Event cards — tighter for sidebar */
  .event-card { padding: 8px 10px; margin-bottom: 5px; }
  .event-title { font-size: 12px; }
  .event-time  { font-size: 11px; }

  /* Agenda empty state fills sidebar */
  .agenda-empty { height: 60%; }

  /* Modal sizing */
  .sheet-footer { padding-bottom: 10px; }
  .btn-add-mobile { display: none; }
}

@media (min-width: 1024px) {
  .agenda-wrap { width: 320px; }
  .topbar { padding: 0 28px; }
  .topbar-title { font-size: 18px; min-width: 190px; }
}

@media (min-width: 1280px) {
  .agenda-wrap { width: 340px; }
  .days-grid { grid-auto-rows: minmax(110px, 1fr); }
}

/* ── Utility ── */
.sr-only { position:absolute; width:1px; height:1px; overflow:hidden; clip:rect(0,0,0,0); }
`;

/* ══════════════════════════════════════════════════════════════
   6. SVG ICONS
══════════════════════════════════════════════════════════════ */
const ChevronLeftIcon: FC = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="15 18 9 12 15 6" />
  </svg>
);
const ChevronRightIcon: FC = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="9 18 15 12 9 6" />
  </svg>
);
const PlusIcon: FC = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);
const XIcon: FC = () => (
  <svg
    width="13"
    height="13"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);
const CalEmptyIcon: FC = () => (
  <svg
    width="26"
    height="26"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="3" y="4" width="18" height="18" rx="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);
const LogoIcon: FC = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
    <rect
      x="3"
      y="4"
      width="18"
      height="18"
      rx="3"
      fill="#007aff"
      opacity=".15"
    />
    <rect
      x="3"
      y="4"
      width="18"
      height="18"
      rx="3"
      stroke="#007aff"
      strokeWidth="1.5"
    />
    <line x1="3" y1="9" x2="21" y2="9" stroke="#007aff" strokeWidth="1.5" />
    <line
      x1="8"
      y1="2"
      x2="8"
      y2="7"
      stroke="#007aff"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <line
      x1="16"
      y1="2"
      x2="16"
      y2="7"
      stroke="#007aff"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <circle cx="8" cy="14" r="1.5" fill="#007aff" />
    <circle cx="12" cy="14" r="1.5" fill="#007aff" />
    <circle cx="16" cy="14" r="1.5" fill="#007aff" />
    <circle cx="8" cy="18" r="1.5" fill="#007aff" />
    <circle cx="12" cy="18" r="1.5" fill="#007aff" />
  </svg>
);

/* ══════════════════════════════════════════════════════════════
   7. MONTH GRID COMPONENT
══════════════════════════════════════════════════════════════ */
interface MonthGridProps {
  year: number;
  month: number;
  events: CalendarEvent[];
  selectedDay: Date | null;
  onSelectDay: (date: Date) => void;
  slideClass: string;
  isDesktop: boolean;
}

// const DAY_FULL: string[] = [
//   "Sunday",
//   "Monday",
//   "Tuesday",
//   "Wednesday",
//   "Thursday",
//   "Friday",
//   "Saturday",
// ];
const DAY_MED: string[] = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const MonthGrid: FC<MonthGridProps> = ({
  year,
  month,
  events,
  selectedDay,
  onSelectDay,
  slideClass,
  isDesktop,
}) => {
  const todayDate = useMemo(() => startOf(new Date()), []);
  const cells = useMemo(() => getCalendarCells(year, month), [year, month]);

  const dotMap = useMemo<Record<number, string[]>>(() => {
    const map: Record<number, string[]> = {};
    events.forEach((ev) => {
      if (ev.start.getFullYear() === year && ev.start.getMonth() === month) {
        const k = ev.start.getDate();
        if (!map[k]) map[k] = [];
        if (map[k].length < 3) map[k].push(ev.color);
      }
    });
    return map;
  }, [events, year, month]);

  const labelMap = useMemo<Record<number, CalendarEvent[]>>(() => {
    const map: Record<number, CalendarEvent[]> = {};
    events.forEach((ev) => {
      if (ev.start.getFullYear() === year && ev.start.getMonth() === month) {
        const k = ev.start.getDate();
        if (!map[k]) map[k] = [];
        map[k].push(ev);
      }
    });
    // Sort: all-day first, then by start time
    Object.keys(map).forEach((k) => {
      map[Number(k)].sort((a, b) => {
        if (a.allDay && !b.allDay) return -1;
        if (!a.allDay && b.allDay) return 1;
        return a.start.getTime() - b.start.getTime();
      });
    });
    return map;
  }, [events, year, month]);

  // Weekday labels — full names on desktop, single letters on mobile
  const weekdayLabels = isDesktop ? DAY_MED : DAY_SHORT;

  return (
    <div className={`grid-overflow grid-slide ${slideClass}`}>
      <div className="weekday-row">
        {weekdayLabels.map((d, i) => (
          <div key={i} className="weekday-cell">
            {d}
          </div>
        ))}
      </div>
      <div className="days-grid">
        {cells.map(({ date, currentMonth }, i) => {
          const isToday = sameDay(date, todayDate);
          const isSelected = selectedDay != null && sameDay(date, selectedDay);
          const colIdx = i % 7;
          const dayEvs = currentMonth ? (labelMap[date.getDate()] ?? []) : [];
          const dots = currentMonth ? (dotMap[date.getDate()] ?? []) : [];

          // Desktop: show 3 chips; mobile: dots only
          const MAX_CHIPS = 3;
          const visibleEvs = dayEvs.slice(0, MAX_CHIPS);
          const extraCount = dayEvs.length - MAX_CHIPS;

          const cls = [
            "day-cell",
            !currentMonth ? "outside" : "",
            isToday ? "is-today" : "",
            isSelected ? "is-selected" : "",
            `col-${colIdx}`,
          ]
            .filter(Boolean)
            .join(" ");

          return (
            <div
              key={i}
              className={cls}
              onClick={() => currentMonth && onSelectDay(date)}
            >
              <div className="day-num">{date.getDate()}</div>

              {/* Mobile: dot indicators */}
              {!isDesktop && (
                <div className="day-dots">
                  {dots.map((c, j) => (
                    <div
                      key={j}
                      className="day-dot"
                      style={{ background: c }}
                    />
                  ))}
                </div>
              )}

              {/* Desktop: event label chips */}
              {isDesktop && dayEvs.length > 0 && (
                <div className="day-labels">
                  {visibleEvs.map((ev) => (
                    <div
                      key={ev.id}
                      className="day-label"
                      title={
                        ev.allDay
                          ? ev.title
                          : `${ev.title} · ${formatTime(ev.start)}`
                      }
                      style={{ background: ev.color + "20", color: ev.color }}
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectDay(date);
                      }}
                    >
                      {!ev.allDay && (
                        <span
                          style={{
                            opacity: 0.75,
                            marginRight: 3,
                            fontWeight: 400,
                          }}
                        >
                          {formatTime(ev.start)
                            .replace(" AM", "a")
                            .replace(" PM", "p")}
                        </span>
                      )}
                      {ev.title}
                    </div>
                  ))}
                  {extraCount > 0 && (
                    <div
                      className="day-more"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectDay(date);
                      }}
                    >
                      +{extraCount} more
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════════════════════
   8. EVENT CARD COMPONENT
══════════════════════════════════════════════════════════════ */
interface EventCardProps {
  event: CalendarEvent;
  onPress: (ev: CalendarEvent) => void;
}
const EventCard: FC<EventCardProps> = ({ event, onPress }) => {
  const timeStr = event.allDay
    ? "All day"
    : `${formatTime(event.start)} – ${formatTime(event.end)}`;
  return (
    <div className="event-card" onClick={() => onPress(event)}>
      <div className="event-bar" style={{ background: event.color }} />
      <div className="event-body">
        <div className="event-title">{event.title}</div>
        <div className="event-time">{timeStr}</div>
      </div>
      {event.allDay && (
        <div
          className="event-badge"
          style={{ background: event.color + "22", color: event.color }}
        >
          All day
        </div>
      )}
    </div>
  );
};

/* ══════════════════════════════════════════════════════════════
   9. AGENDA PANEL COMPONENT
══════════════════════════════════════════════════════════════ */
interface AgendaProps {
  events: CalendarEvent[];
  year: number;
  month: number;
  selectedDay: Date | null;
  onEventPress: (ev: CalendarEvent) => void;
  onClearDay: () => void;
  agendaRef: React.RefObject<HTMLDivElement | null>;
  isDesktop: boolean;
}
const AgendaPanel: FC<AgendaProps> = ({
  events,
  year,
  month,
  selectedDay,
  onEventPress,
  onClearDay,
  agendaRef,
  isDesktop,
}) => {
  const todayDate = useMemo(() => startOf(new Date()), []);

  const monthEventCount = useMemo(
    () =>
      events.filter(
        (ev) =>
          ev.start.getFullYear() === year && ev.start.getMonth() === month,
      ).length,
    [events, year, month],
  );

  const displayDays: Date[] = useMemo(() => {
    if (selectedDay) return [selectedDay];
    return getMonthEventDays(events, year, month);
  }, [selectedDay, events, year, month]);

  const dayEventPairs = useMemo(
    () =>
      displayDays
        .map((day) => ({ day, evs: getEventsForDay(events, day) }))
        .filter((p) => p.evs.length > 0),
    [displayDays, events],
  );

  // Desktop sidebar header content
  const sidebarLabel = selectedDay ? "Selected Day" : MONTH_NAMES[month];
  const sidebarHeading = selectedDay
    ? `${DAY_LONG[selectedDay.getDay()]}, ${selectedDay.getDate()}`
    : `${monthEventCount} event${monthEventCount !== 1 ? "s" : ""}`;
  const sidebarSub = selectedDay
    ? `${getEventsForDay(events, selectedDay).length} event${getEventsForDay(events, selectedDay).length !== 1 ? "s" : ""}`
    : `in ${MONTH_NAMES[month]} ${year}`;

  const emptyContent = (
    <div className="agenda-panel" ref={agendaRef}>
      <div className="agenda-empty">
        <div className="agenda-empty-icon">
          <CalEmptyIcon />
        </div>
        <div className="agenda-empty-title">
          {selectedDay ? "No events" : "Nothing scheduled"}
        </div>
        <div className="agenda-empty-sub">
          {selectedDay
            ? `Nothing on ${DAY_LONG[selectedDay.getDay()]}, ${MONTH_NAMES[selectedDay.getMonth()]} ${selectedDay.getDate()}`
            : `No events in ${MONTH_NAMES[month]} ${year}`}
        </div>
      </div>
    </div>
  );

  return (
    <div className="agenda-wrap">
      {/* Desktop sidebar header */}
      {isDesktop && (
        <div className="agenda-sidebar-top">
          <div className="agenda-sidebar-label">{sidebarLabel}</div>
          <div className="agenda-sidebar-heading">{sidebarHeading}</div>
          <div className="agenda-sidebar-sub">{sidebarSub}</div>
          {selectedDay && (
            <button className="agenda-sidebar-clear" onClick={onClearDay}>
              <XIcon /> Show all month
            </button>
          )}
        </div>
      )}

      {/* Empty state */}
      {dayEventPairs.length === 0 ? (
        emptyContent
      ) : (
        <div className="agenda-panel" ref={agendaRef}>
          {dayEventPairs.map(({ day, evs }) => {
            const isToday = sameDay(day, todayDate);
            return (
              <div key={day.toISOString()} className="agenda-day-block">
                <div
                  className={`agenda-day-header ${isToday ? "is-today" : ""}`}
                >
                  <div className="agenda-day-num">{day.getDate()}</div>
                  <div className="agenda-day-meta">
                    <div className="agenda-day-name">
                      {DAY_LONG[day.getDay()]}
                    </div>
                    <div className="agenda-day-count">
                      {evs.length} event{evs.length !== 1 ? "s" : ""}
                    </div>
                  </div>
                </div>
                {evs.map((ev) => (
                  <EventCard key={ev.id} event={ev} onPress={onEventPress} />
                ))}
              </div>
            );
          })}
          <div style={{ height: 32 }} />
        </div>
      )}
    </div>
  );
};

/* ══════════════════════════════════════════════════════════════
   10. ADD / EDIT EVENT SHEET
══════════════════════════════════════════════════════════════ */
interface EventSheetProps {
  event?: CalendarEvent;
  defaultDate: Date;
  isDesktop: boolean;
  onSave: (data: Omit<CalendarEvent, "id"> & { id?: number }) => void;
  onDelete: (id: number) => void;
  onClose: () => void;
}
const EventSheet: FC<EventSheetProps> = ({
  event,
  defaultDate,
  isDesktop,
  onSave,
  onDelete,
  onClose,
}) => {
  const isEdit = Boolean(event);
  const [title, setTitle] = useState<string>(event?.title ?? "");
  const [color, setColor] = useState<string>(event?.color ?? COLOR_PALETTE[0]);
  const [allDay, setAllDay] = useState<boolean>(event?.allDay ?? false);
  const [dateStr, setDateStr] = useState<string>(
    toDateInput(event?.start ?? defaultDate),
  );
  const [startT, setStartT] = useState<string>(
    toTimeInput(event?.start ?? new Date()),
  );
  const [endT, setEndT] = useState<string>(
    toTimeInput(event?.end ?? new Date()),
  );

  const handleSave = useCallback(() => {
    if (!title.trim()) return;
    const start = allDay
      ? parseDateTime(dateStr, "00:00")
      : parseDateTime(dateStr, startT);
    const end = allDay
      ? parseDateTime(dateStr, "23:59")
      : parseDateTime(dateStr, endT);
    onSave({ id: event?.id, title: title.trim(), start, end, color, allDay });
  }, [title, allDay, dateStr, startT, endT, color, event, onSave]);

  // ⚠️ NOTE: Do NOT define a Wrapper component here — components defined inside
  // render functions get a new identity on every re-render, causing React to
  // unmount + remount the entire subtree on every keystroke, retriggering the
  // CSS animation. Inline the overlay JSX directly instead.
  return (
    <div
      className={`overlay ${isDesktop ? "modal-mode" : ""}`}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className={isDesktop ? "modal" : "sheet"}>
        {!isDesktop && <div className="sheet-handle" />}
        <div className="sheet-header">
          <div className="sheet-title">
            {isEdit ? "Edit Event" : "New Event"}
          </div>
          <button className="close-btn" onClick={onClose}>
            <XIcon />
          </button>
        </div>
        <div className="sheet-body">
          <div>
            <div className="field-label">Title</div>
            <input
              className="cal-input"
              placeholder="Event title…"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              autoFocus
            />
          </div>
          <div>
            <div className="field-label">Date</div>
            <input
              type="date"
              className="cal-input"
              value={dateStr}
              onChange={(e) => setDateStr(e.target.value)}
            />
          </div>
          <div className="toggle-row">
            <span className="toggle-label">All-day event</span>
            <button
              className={`toggle-btn ${allDay ? "on" : ""}`}
              onClick={() => setAllDay((v) => !v)}
            />
          </div>
          {!allDay && (
            <div className="row-2">
              <div>
                <div className="field-label">Start time</div>
                <input
                  type="time"
                  className="cal-input"
                  value={startT}
                  onChange={(e) => setStartT(e.target.value)}
                />
              </div>
              <div>
                <div className="field-label">End time</div>
                <input
                  type="time"
                  className="cal-input"
                  value={endT}
                  onChange={(e) => setEndT(e.target.value)}
                />
              </div>
            </div>
          )}
          <div>
            <div className="field-label">Color</div>
            <div className="color-picker">
              {COLOR_PALETTE.map((c) => (
                <div
                  key={c}
                  className={`color-swatch ${c === color ? "selected" : ""}`}
                  style={{ background: c }}
                  onClick={() => setColor(c)}
                />
              ))}
            </div>
          </div>
        </div>
        <div className="sheet-footer">
          {isEdit && event && (
            <button
              className="btn btn-danger"
              onClick={() => onDelete(event.id)}
            >
              Delete
            </button>
          )}
          <button className="btn btn-ghost" onClick={onClose}>
            Cancel
          </button>
          <button className="btn btn-primary" onClick={handleSave}>
            {isEdit ? "Save Changes" : "Add Event"}
          </button>
        </div>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════════════════════
   11. EVENT DETAIL SHEET
══════════════════════════════════════════════════════════════ */
interface DetailSheetProps {
  event: CalendarEvent;
  isDesktop: boolean;
  onEdit: (ev: CalendarEvent) => void;
  onDelete: (id: number) => void;
  onClose: () => void;
}
const DetailSheet: FC<DetailSheetProps> = ({
  event,
  isDesktop,
  onEdit,
  onDelete,
  onClose,
}) => {
  const timeStr = event.allDay
    ? "All day"
    : `${formatTime(event.start)} – ${formatTime(event.end)}`;

  return (
    <div
      className={`overlay ${isDesktop ? "modal-mode" : ""}`}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className={isDesktop ? "modal" : "sheet"}>
        {!isDesktop && <div className="sheet-handle" />}
        <div
          className="detail-color-strip"
          style={{
            background: event.color + "40",
            borderLeft: `4px solid ${event.color}`,
          }}
        />
        <div className="detail-title">{event.title}</div>
        <div className="detail-time">{timeStr}</div>
        <div className="sheet-footer">
          <button
            className="btn btn-danger"
            onClick={() => {
              onDelete(event.id);
              onClose();
            }}
          >
            Delete
          </button>
          <button className="btn btn-ghost" onClick={onClose}>
            Close
          </button>
          <button className="btn btn-primary" onClick={() => onEdit(event)}>
            Edit Event
          </button>
        </div>
        <div style={{ height: 8 }} />
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════════════════════
   12. ROOT APP COMPONENT
══════════════════════════════════════════════════════════════ */
const MobiScrollCalendar: FC = () => {
  const [events, setEvents] = useState<CalendarEvent[]>(INITIAL_EVENTS);
  const [viewYear, setViewYear] = useState<number>(NOW.getFullYear());
  const [viewMonth, setViewMonth] = useState<number>(NOW.getMonth());
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [slideClass, setSlideClass] = useState<string>("");
  const [sheet, setSheet] = useState<SheetState | null>(null);
  const [isDesktop, setIsDesktop] = useState<boolean>(window.innerWidth >= 768);

  const agendaRef = useRef<HTMLDivElement | null>(null);

  /* Inject styles once */
  useEffect(() => {
    const existing = document.getElementById("mbsc-clone-styles");
    if (existing) existing.remove();
    const tag = document.createElement("style");
    tag.id = "mbsc-clone-styles";
    tag.textContent = GLOBAL_CSS;
    document.head.appendChild(tag);
    return () => {
      tag.remove();
    };
  }, []);

  /* Track viewport */
  useEffect(() => {
    const handler = () => setIsDesktop(window.innerWidth >= 768);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

  /* Month navigation */
  const goMonth = useCallback((dir: 1 | -1) => {
    setSlideClass(dir === 1 ? "slide-left" : "slide-right");
    setTimeout(() => setSlideClass(""), 320);
    setViewMonth((m) => {
      if (dir === 1 && m === 11) {
        setViewYear((y) => y + 1);
        return 0;
      }
      if (dir === -1 && m === 0) {
        setViewYear((y) => y - 1);
        return 11;
      }
      return m + dir;
    });
    setSelectedDay(null);
    if (agendaRef.current) agendaRef.current.scrollTop = 0;
  }, []);

  const goToday = useCallback(() => {
    const t = new Date();
    setViewYear(t.getFullYear());
    setViewMonth(t.getMonth());
    setSelectedDay(startOf(t));
    setSlideClass("slide-left");
    setTimeout(() => setSlideClass(""), 320);
    if (agendaRef.current) agendaRef.current.scrollTop = 0;
  }, []);

  const handleSelectDay = useCallback((date: Date) => {
    setSelectedDay((prev) => (prev && sameDay(prev, date) ? null : date));
    if (agendaRef.current) agendaRef.current.scrollTop = 0;
  }, []);

  const handleClearDay = useCallback(() => {
    setSelectedDay(null);
    if (agendaRef.current) agendaRef.current.scrollTop = 0;
  }, []);

  /* CRUD */
  const handleSave = useCallback(
    (data: Omit<CalendarEvent, "id"> & { id?: number }) => {
      setEvents((prev) =>
        data.id
          ? prev.map((e) =>
              e.id === data.id ? ({ ...e, ...data } as CalendarEvent) : e,
            )
          : [...prev, { ...data, id: Date.now() } as CalendarEvent],
      );
      setSheet(null);
    },
    [],
  );

  const handleDelete = useCallback((id: number) => {
    setEvents((prev) => prev.filter((e) => e.id !== id));
    setSheet(null);
  }, []);

  const isCurrentMonth =
    viewYear === NOW.getFullYear() && viewMonth === NOW.getMonth();

  const monthEventCount = useMemo(
    () =>
      events.filter(
        (ev) =>
          ev.start.getFullYear() === viewYear &&
          ev.start.getMonth() === viewMonth,
      ).length,
    [events, viewYear, viewMonth],
  );

  const sharedGridProps = {
    year: viewYear,
    month: viewMonth,
    events,
    selectedDay,
    onSelectDay: handleSelectDay,
    slideClass,
    isDesktop,
  };

  return (
    <div className="app-shell">
      {/* ══ TOPBAR ══ */}
      <header className="topbar">
        {/* Left: logo */}
        <div className="topbar-logo">
          <LogoIcon />
          {/* <span>CalClone</span> */}
        </div>

        <div className="topbar-divider" />

        {/* Centre: month navigation */}
        <div className="topbar-nav">
          <button
            className="icon-btn"
            onClick={() => goMonth(-1)}
            aria-label="Previous month"
          >
            <ChevronLeftIcon />
          </button>
          <div className="topbar-title">
            {MONTH_NAMES[viewMonth]} {viewYear}
          </div>
          <button
            className="icon-btn"
            onClick={() => goMonth(1)}
            aria-label="Next month"
          >
            <ChevronRightIcon />
          </button>
        </div>

        {/* Right: event count badge + today + add */}
        <div className="topbar-right">
          {/* Event count — desktop only */}
          {isDesktop && monthEventCount > 0 && (
            <div className="event-count-badge">
              <div className="event-count-dot" />
              {monthEventCount} event{monthEventCount !== 1 ? "s" : ""}
            </div>
          )}

          {/* Today button — only when not on current month */}
          {!isCurrentMonth && (
            <button className="today-pill" onClick={goToday}>
              Today
            </button>
          )}

          {/* Add event — pill on desktop, circle on mobile */}
          <button
            className="btn-add-desktop"
            onClick={() => setSheet({ mode: "add" })}
            aria-label="Add event"
          >
            <PlusIcon /> New event
          </button>
          <button
            className="btn-add-mobile"
            onClick={() => setSheet({ mode: "add" })}
            aria-label="Add event"
          >
            <PlusIcon />
          </button>
        </div>
      </header>

      {/* ══ MAIN BODY ══ */}
      <div className="main-content">
        {/* Mobile: calendar stacked on top */}
        <div className="calendar-panel mobile">
          <MonthGrid {...sharedGridProps} />
        </div>

        {/* Desktop: calendar fills the main area (hero) */}
        <div className="calendar-panel desktop">
          <MonthGrid {...sharedGridProps} />
        </div>

        {/* Agenda: full-height sidebar on desktop, scrollable below on mobile */}
        <AgendaPanel
          events={events}
          year={viewYear}
          month={viewMonth}
          selectedDay={selectedDay}
          onEventPress={(ev) => setSheet({ mode: "detail", event: ev })}
          onClearDay={handleClearDay}
          agendaRef={agendaRef}
          isDesktop={isDesktop}
        />
      </div>

      {/* ══ SHEETS / MODALS ══ */}
      {sheet?.mode === "add" && (
        <EventSheet
          defaultDate={selectedDay ?? new Date()}
          isDesktop={isDesktop}
          onSave={handleSave}
          onDelete={handleDelete}
          onClose={() => setSheet(null)}
        />
      )}
      {sheet?.mode === "edit" && sheet.event && (
        <EventSheet
          event={sheet.event}
          defaultDate={sheet.event.start}
          isDesktop={isDesktop}
          onSave={handleSave}
          onDelete={handleDelete}
          onClose={() => setSheet(null)}
        />
      )}
      {sheet?.mode === "detail" && sheet.event && (
        <DetailSheet
          event={sheet.event}
          isDesktop={isDesktop}
          onEdit={(ev) => setSheet({ mode: "edit", event: ev })}
          onDelete={handleDelete}
          onClose={() => setSheet(null)}
        />
      )}
    </div>
  );
};

export default MobiScrollCalendar;
