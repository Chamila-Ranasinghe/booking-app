import { useCallback, useState, useMemo, type FC, useEffect } from "react";
import { BookingStatus, type EventSheetProps } from "../classes/CalendarClass";
import { COLOR_PALETTE, type SportInterface} from "../classes/CalendarData";
import { toDateInput } from "../classes/CalendarFunctions";
import { XIcon } from "../icons/CalenderIcons";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import "../css/EventSheetComponent.scss";
import { getRecords, useApiQuery } from "../api/common";
import { getSports, getTimeSlots } from "../api/APIclass";
import { useAuth } from "./AuthManager/AuthContext";
import type { EventSheetErrors } from "../classes/RegisterClass";
import { AlertIcon } from "../icons/RegisterIcons";
import Catalog from "./loaders/Catalog";
import AuthorsList from "./loaders/AuthorsList";

export const EventSheet: FC<EventSheetProps> = ({
  event,
  defaultDate,
  isDesktop,
  onSave,
  onDelete,
  onClose,
}) => {

  const [dateStr, setDateStr] = useState<string>(
    toDateInput(event?.date ?? defaultDate),
  );
  const isEdit = Boolean(event);
  const { user } = useAuth();
  const {data : sports, isLoading: isSportsLoading } = useApiQuery(["sports"],getRecords(getSports));
  const {data : timeSlot, isLoading: isTimeSlotsLoading} = useApiQuery(["timeslots", dateStr],getRecords(getTimeSlots, {date: dateStr}));
  const ALL_SLOTS = timeSlot?.data;
  let recurringDefaultDate = new Date;

  
const SLOT_PERIODS = [
  {
    label: "Morning",
    slots: ALL_SLOTS?.filter((s: any) => s.timePeriod == 1),
  },
  {
    label: "Afternoon",
    slots: ALL_SLOTS?.filter((s: any) => s.timePeriod == 2),
  },
  {
    label: "Evening",
    slots: ALL_SLOTS?.filter((s: any) => s.timePeriod == 3),
  },
];

function formatSlotLabel(id: number): string {
  return ALL_SLOTS?.find((u: any) => u.id == id)?.timeSlotName || "";
}

const initialSlots = useMemo<number[]>(() => {
  if (!event || event.allDay) return [];
  const slots: number[] = [];
  event.timeSlots?.map((time: number) => {
    slots.push(Number(time));
  });
  return slots;
}, [event]);

const isPastEvent: boolean = event?.date && new Date(event.date).setHours(0, 0, 0, 0) < new Date().setHours(0, 0, 0, 0) || false;

useEffect(() => {
 
  if (!user) return;
  if (!user.isAdmin) {
    setTitle(`${user.firstname} ${user.lastname} - ${user.phone}`);
  }

  recurringDefaultDate = new Date(new Date(dateStr).setDate(new Date(dateStr).getDate() + 1));
  
}, [user]);

  const [errors,   setErrors]   = useState<EventSheetErrors>({});
  const [title, setTitle] = useState<string>(event?.title ?? "");
  const [color, setColor] = useState<string>(event?.color ?? COLOR_PALETTE[0]);
  const [allDay, setAllDay] = useState<boolean>(event?.allDay ?? false);
  const [recurringEvent, setRecurring] = useState<boolean>(event?.recurringEvent ?? false,);
  const [selectedsport, setSport] = useState<number>(event?.sport ?? 0);
  const [selSlots, setSelSlots] = useState<number[]>(initialSlots);
  const [sportRate, setSportRate] = useState<number>(sports?.data.find((v: SportInterface) => v.id == selectedsport)?.rate ?? 0);
  const [recurringEndDate, setrecurringEndDate] = useState<string>(toDateInput(event?.recurringEndDate ?? recurringDefaultDate));

  const toggleSlot = useCallback((hour: number, isbooked: boolean = false) => {
    if(isbooked) return;
    setSelSlots((prev) =>
      prev.includes(hour) ? prev.filter((h) => h !== hour) : [...prev, hour],
    );
  }, []);

  const clearSlots = useCallback(() => setSelSlots([]), []);
 
  const handleDateChange = useCallback((bookingdate: string) =>{
    setDateStr(bookingdate)
    let recurrdate = new Date(new Date(bookingdate).setDate(new Date(bookingdate).getDate() + 1)).toDateString();
    setrecurringEndDate(recurrdate);
    console.log(recurrdate);
  },[]);
  

  const validate = (): boolean => {
      const errs: EventSheetErrors = {};
      if(!title.trim()) errs.title = "Please enter a booking name";
      if (selectedsport == 0) errs.sport = "Please Select a sport !";
      if (dateStr && new Date(dateStr).setHours(0, 0, 0, 0) < new Date().setHours(0, 0, 0, 0)) errs.date = "Please choose a future Date !";
      // if (recurringEvent && new Date(recurringEndDate).setHours(0, 0, 0, 0) == new Date(dateStr).setHours(0, 0, 0, 0)) errs.recurringEndDate = "Recurring date should be a future date"
      if (!allDay && selSlots && selSlots.length == 0) errs.timeslots = "Please select at least 1 available time slot !";
      setErrors(errs);
      return Object.keys(errs).length === 0;
    };

  const handleSave = useCallback(() => {
    if (!validate()) return;
    let start: Date | undefined, end: Date, bookedDate:Date;
    const recurringDatesArray = [];
    // if(allDay){

    // }
    if (recurringEvent && recurringEndDate) {
      let current = dayjs(dateStr);
      const end = dayjs(recurringEndDate);

      while (current.isBefore(end) || current.isSame(end, "day")) {
        recurringDatesArray.push(current.format("YYYY-MM-DD"));
        current = current.add(1, "week");
      }
    }
    start = new Date(`${dateStr}T00:00:00`);
    end = new Date(`${dateStr}T00:00:00`);
    bookedDate = new Date(`${dateStr}T00:00:00`);

    onSave({
      id: event?.id,
      title: title.trim(),
      start,
      end,
      color,
      allDay: allDay || selSlots.length === 0,
      recurringEvent,
      sport: selectedsport || undefined,
      timeSlots: selSlots.length
        ? [...selSlots].sort((a, b) => a - b)
        : [],
      date: bookedDate,
      bookingPrice: selSlots.length * sportRate,
      recurringDates: recurringDatesArray,
      recurringEndDate: new Date(`${recurringEndDate}T00:00:00`)
    });
  }, [
    title,
    allDay,
    dateStr,
    selSlots,
    color,
    selectedsport,
    recurringEvent,
    event,
    onSave,
  ]);

  /* Sorted selected slots for display */
  const sortedSel = useMemo(
    () => [...selSlots].sort((a, b) => a - b),
    [selSlots],
  );

  return (
    <div
      className={`overlay ${isDesktop ? "modal-mode" : ""}`}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className={isDesktop ? "modal" : "sheet"}>
        {!isDesktop && <div className="sheet-handle" />}

        <div className="sheet-header">
          <div className="sheet-title">
            {isEdit ? "Edit Booking" : "New Booking"}
          </div>
          <button className="close-btn" onClick={onClose}>
            <XIcon />
          </button>
        </div>

        <div className="sheet-body">
          <div>
            <div className="field-label">Booking Name</div>
            <input
              className="cal-input disabled-field"
              placeholder="Event title…"
              value={title}
              disabled={!user?.isAdmin}
              onChange={(e) => setTitle(e.target.value)}
            />
            {errors.title && (
              <span className="field-err">
                <AlertIcon />
                {errors.title}
              </span>
            )}
          </div>

          <div>
            <div className="field-label">Sport</div>
            <div className="select-wrap">
              <div className="ss-grid">
                {isSportsLoading ? (
                  <div className="sports-loader">
                    <Catalog />
                  </div>
                ) : (
                  sports?.data.map((sport: SportInterface) => (
                    <button
                      key={sport.id}
                      onClick={() => {
                        setSport(sport.id);
                        setSportRate(sport.rate);
                      }}
                      className={`ss-card${selectedsport === sport.id ? " ss-active" : ""}`}
                      aria-pressed={selectedsport === sport.id}
                      aria-label={sport.sportname}
                    >
                      <span className="ss-icon">
                        <img src={sport.icon}></img>
                      </span>
                      <span className="ss-label">{sport.sportname}</span>
                    </button>
                  ))
                )}
              </div>
            </div>
            {errors.sport && (
              <span className="field-err">
                <AlertIcon />
                {errors.sport}
              </span>
            )}
          </div>

          <div>
            <div className="field-label">Date</div>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                className="cal-input"
                disablePast
                defaultValue={dayjs(dateStr)}
                onChange={(newvalue) =>
                  // setDateStr(newvalue ? newvalue.format("YYYY-MM-DD") : "")
                  handleDateChange(
                    newvalue ? newvalue.format("YYYY-MM-DD") : ""
                  )
                }
              />
            </LocalizationProvider>
            {errors.date && (
              <span className="field-err">
                <AlertIcon />
                {errors.date}
              </span>
            )}
          </div>

          <div className="toggle-row">
            <span className="toggle-label">Recurring Event</span>
            <button
              className={`toggle-btn ${recurringEvent ? "on" : ""}`}
              onClick={() => setRecurring((v) => !v)}
            />
            {recurringEvent && (
              <>
               
                <span className="toggle-label">End Date</span>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DatePicker
                    className="cal-input calinput-width"
                    minDate={dayjs(dateStr)}
                    defaultValue={dayjs(recurringEndDate)}
                    onChange={(newvalue) =>
                      setrecurringEndDate(
                        newvalue ? newvalue.format("YYYY-MM-DD") : "",
                      )
                    }
                    value={dayjs(recurringEndDate)}
                  />
                </LocalizationProvider>
                 {/* {errors.recurringEndDate && (
              <span className="field-err">
                <AlertIcon />
                {errors.recurringEndDate}
              </span>
            )} */}
            
              </>
            )}
          </div>
          <div className="toggle-row">
            <span className="toggle-label">All-day event</span>
            <button
              className={`toggle-btn ${allDay ? "on" : ""}`}
              onClick={() => {
                if(!isEdit) clearSlots();
                setAllDay((v) => !v);}}
            />
          </div>

          {/* ── Time Slot Picker ── */}
          {!allDay && (
            <div className="slot-section">
              <div className="field-label">
                Time Slots
                <span
                  style={{
                    fontWeight: 500,
                    textTransform: "none",
                    letterSpacing: 0,
                    marginLeft: 6,
                    color: "var(--text-5)",
                    fontSize: 10,
                  }}
                >
                  — pick one or more 1-hr blocks
                </span>
                <div className="status">
                  <span className="dot available"></span> Available
                  <span className="dot booked"></span> Booked
                </div>
              </div>

              {/* Selected summary bar */}
              <div className="slot-summary">
                {sortedSel.length === 0 ? (
                  <span className="slot-empty-hint">
                    No slots selected yet…
                  </span>
                ) : (
                  <>
                    {sortedSel.map((h) => (
                      <div key={h} className="slot-chip">
                        {formatSlotLabel(h)}
                        <span
                          style={{
                            cursor: "pointer",
                            opacity: 0.7,
                            display: "flex",
                            alignItems: "center",
                          }}
                          onClick={() => toggleSlot(h)}
                        >
                          <svg
                            width="9"
                            height="9"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="3"
                            strokeLinecap="round"
                          >
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                          </svg>
                        </span>
                      </div>
                    ))}
                    <button className="slot-clear" onClick={clearSlots}>
                      Clear all
                    </button>
                  </>
                )}
              </div>
              {errors.timeslots && (
                <span className="field-err">
                  <AlertIcon />
                  {errors.timeslots}
                </span>
              )}
              {/* Slot grid grouped by period */}
              {isTimeSlotsLoading ? (
                <div>
                  <AuthorsList />
                </div>
              ) : (
                SLOT_PERIODS?.map((period) => (
                  <div key={period.label}>
                    <div className="slot-period-label">{period.label}</div>
                    <div className="slot-grid">
                      {period?.slots?.map(
                        ({ id, timeSlotName, isbooked }: any) => (
                          <div
                            key={id}
                            className={`slot-pill ${selSlots.includes(id) ? "slot-selected" : isbooked ? "booked" : ""}`}
                            onClick={() => toggleSlot(id, isbooked)}
                          >
                            {timeSlotName}
                          </div>
                        ),
                      )}
                    </div>
                  </div>
                ))
              )}
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
        <div className="total-price-display">
          <span className="total-tag">
            {selSlots.length} slots / Total: Rs:
            {selSlots.length * sportRate}
          </span>
        </div>
        {!isPastEvent && event?.status != BookingStatus.CONFIRMED && (
          <div className="sheet-footer">
            {isEdit && event && (
              <button
                className="btn btn-danger"
                onClick={() => onDelete(event.id)}
              >
                Delete
              </button>
            )}
            <button className="btn btn-primary" onClick={handleSave}>
              {isEdit ? "Save Changes" : "Book"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
