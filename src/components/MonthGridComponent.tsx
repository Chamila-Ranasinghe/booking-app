import { useMemo, type FC } from "react";
import type { CalendarEvent, MonthGridProps } from "../classes/CalendarClass";
import { DAY_SHORT, DAY_MED } from "../classes/CalendarData";
import {
  sameDay,
  startOf,
  getCalendarCells,
} from "../classes/CalendarFunctions";

export const MonthGrid: FC<MonthGridProps> = ({
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
                          : `${ev.title}`
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
                          {/* {formatTime(ev.start)
                            .replace(" AM", "a")
                            .replace(" PM", "p")} */}
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
