import { useMemo, type FC } from "react";
import { type AgendaProps } from "../classes/CalendarClass";
import { EventCard } from "../components/EventCardComponent";
import {
  sameDay,
  startOf,
  getMonthEventDays,
  getEventsForDay,
} from "../classes/CalendarFunctions";
import { CalEmptyIcon } from "../icons/CalenderIcons";
import { MONTH_NAMES, DAY_LONG } from "../classes/CalendarData";
import "../css/AgendaPanelComponent.scss";

export const AgendaPanel: FC<AgendaProps> = ({
  events,
  year,
  month,
  selectedDay,
  onEventPress,
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
  // const sidebarLabel = selectedDay ? "Selected Day" : MONTH_NAMES[month];
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
          {/* <div className="agenda-sidebar-label">{sidebarLabel}</div> */}
          <div className="day-event-container">
            <div className="agenda-sidebar-heading">{sidebarHeading}</div>
            <div className="agenda-sidebar-sub">{sidebarSub}</div>
             {/* {selectedDay && (
            <button className="agenda-sidebar-clear" onClick={onClearDay}>
              <XIcon /> Show all month
            </button>
          )} */}
          </div>
         
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
                <div className={`agenda-day-header ${isToday ? "is-today" : ""}`}>
                  <div></div>
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
