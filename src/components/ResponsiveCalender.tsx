import {
  useState,
  useMemo,
  useCallback,
  useEffect,
  useRef,
  type FC,
} from "react";
import { BookingStatus, type CalendarEvent, type SheetState } from "../classes/CalendarClass";
import { MONTH_NAMES } from "../classes/CalendarData";
import { sameDay, startOf } from "../classes/CalendarFunctions";
import "../css/ResponsiveCalender.scss";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  LogoIcon,
} from "../icons/CalenderIcons";
import { MonthGrid } from "../components/MonthGridComponent";
import { DetailSheet } from "../components/EventDetailComponent";
import { AgendaPanel } from "../components/AgendaPanelComponent";
import { EventSheet } from "../components/EventSheetComponent";
import { createRecords, getRecords, useApiMutation, useApiQuery, type ResponseObj } from "../api/common";
import { createBooking, editBookings, getBookings, confirmEvents, deleteEvents} from "../api/APIclass";
import { useAuth } from "./AuthManager/AuthContext";
import { useQueryClient } from "@tanstack/react-query";

const NOW = new Date();
const INITIAL_EVENTS: CalendarEvent[] = [];

/* ══════════════════════════════════════════════════════════════
   12. ROOT APP COMPONENT
══════════════════════════════════════════════════════════════ */
const MobiScrollCalendar: FC = () => {
  const queryClient = useQueryClient();
  const [events, setEvents] = useState<CalendarEvent[]>(INITIAL_EVENTS);
  const [viewYear, setViewYear] = useState<number>(NOW.getFullYear());
  const [viewMonth, setViewMonth] = useState<number>(NOW.getMonth());
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [slideClass, setSlideClass] = useState<string>("");
  const [sheet, setSheet] = useState<SheetState | null>(null);
  const [isDesktop, setIsDesktop] = useState<boolean>(window.innerWidth >= 768);

  const agendaRef = useRef<HTMLDivElement | null>(null);

  const { user } = useAuth();
  const saveEvent = useApiMutation(createRecords(createBooking), ["create_booking"]);
  const editEvent = useApiMutation(createRecords(editBookings),["edit_booking"]);
  const confirmEvent = useApiMutation(createRecords(confirmEvents),["confirm_booking"]);
  const deleteEvent = useApiMutation(createRecords(deleteEvents),["delete_booking"]);
  const {data: bookingData, refetch: refetchBookings } = 
  useApiQuery(["allbookings"], getRecords(getBookings));
  const [pressed, setPressed] = useState(false);

  useEffect(() => {
    if (bookingData?.data) {
      const mappedEvents = bookingData.data.map((item: any) => ({
        id: item.BookingId.toString(),
        title: item.eventTitle,
        date: item.booking_date,
        start: new Date(item.booking_date),
        end: new Date(item.booking_date),
        color: item.colors,
        allDay: item.is_all_day,
        recurringEvent: item.is_recurr_event,
        sport: item.sport_id,
        timeSlots: item.timeslots,
        fullName : item.full_name,
        phone: item.phone,
        sportName: item.sport_name,
        bookingPrice: item.booking_price,
        status:item.status
      }));
      setEvents(mappedEvents);
    }

    const handler = () => setIsDesktop(window.innerWidth >= 768);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, [bookingData?.data]);

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
      let requestObj = {
          id: data.id,
          title: data.title,
          sport_id: data.sport,
          client_id: user?.id,
          booking_date: new Date(data.date).toISOString().split('T')[0],
          is_recurr_event: data.recurringEvent,
          is_all_day: data.allDay,
          status: BookingStatus.PENDING,
          timeSlots: data.timeSlots,
          color: data.color,
          booking_price:data.bookingPrice
        };
      if (!data.id) {
        /// saving a new event
        saveEvent.mutate(requestObj, {
          onSuccess: (response: ResponseObj<any>) => {
            if (response.success) {
              refetchBookings();
              setSheet(null);
              queryClient.invalidateQueries({
                queryKey: ["timeslots", requestObj.booking_date],
              });
            }
          },
        });
      } else {
        ///updating a new event
        if (data.id) {
          editEvent.mutate(requestObj, {
            onSuccess: (response: ResponseObj<any>) => {
              if (response.success) {
                refetchBookings();
                setSheet(null);
                queryClient.invalidateQueries({
                queryKey: ["timeslots", requestObj.booking_date],
              });
              }
            },
          });
        }
      }
    },
    [],
  );

  const handleDelete = useCallback((id: number) => {
    if (id) {
      let requestObj = {
        bookingId: id,
      };
      deleteEvent.mutate(requestObj, {
        onSuccess: (response: ResponseObj<any>) => {
          if (response.success) {
            refetchBookings();
            setSheet(null);
          }
        },
      });
    }
  }, []);

  const handleOnconfirm = useCallback((data: CalendarEvent) => {
    if (data) {
      let requestObj = {
        bookingId: data?.id,
      };
      confirmEvent.mutate(requestObj, {
        onSuccess: (response: ResponseObj<any>) => {
          if (response.success) {
            refetchBookings();
            setSheet(null);

          }
        },
      });
    }
  }, []);

  // const isCurrentMonth =
  //   viewYear === NOW.getFullYear() && viewMonth === NOW.getMonth();

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

        {/* <div className="topbar-divider" /> */}

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
          {/* {!isCurrentMonth && (
            <button className="today-pill" onClick={goToday}>
              Today
            </button>
          )} */}

          {/* Add event — pill on desktop, circle on mobile */}
          {/* <button
            className="btn-add-desktop"
            onClick={() => setSheet({ mode: "add" })}
            aria-label="Add event"
          >
            <PlusIcon /> BOOK
          </button> */}

          <button
            className={`gp-btn${pressed ? " pressed" : ""}`}
            onClick={() => {
              setPressed(true);
              setTimeout(() => setPressed(false), 150);
              setSheet({ mode: "add" });}}
          >
            <div className="gp-inner">
              <span className="gp-text">Book Now</span>
              {/* <span className="gp-icon">→</span> */}
              {/* {ripples.map((r:any) => (
                <span
                  key={r.id}
                  className="ripple"
                  style={{ left: r.x, top: r.y }}
                />
              ))} */}
            </div>
          </button>

          {/* <button
            className="btn-add-mobile"
            onClick={() => setSheet({ mode: "add" })}
            aria-label="Add event"
          >
            <PlusIcon />
          </button> */}
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
          onConfirm={(ev)=> handleOnconfirm(ev)} 
        />
      )}
    </div>
  );
};

export default MobiScrollCalendar;
