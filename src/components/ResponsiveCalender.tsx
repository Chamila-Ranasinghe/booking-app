import {
  useState,
  useMemo,
  useCallback,
  useEffect,
  useRef,
  type FC,
} from "react";
import type { CalendarEvent, SheetState } from "../classes/CalendarClass";
import { MONTH_NAMES } from "../classes/CalendarData";
import { sameDay, startOf } from "../classes/CalendarFunctions";
import "../css/ResponsiveCalender.css";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  PlusIcon,
  LogoIcon,
} from "../icons/CalenderIcons";
import { MonthGrid } from "../components/MonthGridComponent";
import { DetailSheet } from "../components/EventDetailComponent";
import { AgendaPanel } from "../components/AgendaPanelComponent";
import { EventSheet } from "../components/EventSheetComponent";

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
  mkEvent("1-on-1", CM, NOW.getDate(), 10, 0, 10, 30, "#3b82f6"),
  mkEvent("Morning Run", CM, NOW.getDate(), 7, 0, 8, 0, "#10b981"),
];

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

  /* Track viewport */
  useEffect(() => {
    const handler = () => setIsDesktop(window.innerWidth >= 768);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

  /* Month navigation */
  const goMonth = useCallback(
    (dir: 1 | -1) => {
      setSlideClass(dir === 1 ? "slide-left" : "slide-right");
      setTimeout(() => setSlideClass(""), 320);
      let newMonth = viewMonth + dir;
      let newYear = viewYear;
      if (newMonth > 11) {
        newMonth = 0;
        newYear++;
      }
      if (newMonth < 0) {
        newMonth = 11;
        newYear--;
      }
      setViewMonth(newMonth);
      setViewYear(newYear);
      setSelectedDay(null);
      if (agendaRef.current) agendaRef.current.scrollTop = 0;
    },
    [viewMonth, viewYear],
  );

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
