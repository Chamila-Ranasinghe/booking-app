import { useCallback, useState, useMemo, type FC, useEffect } from "react";
import { type EventSheetProps } from "../classes/CalendarClass";
import { COLOR_PALETTE, type SportInterface} from "../classes/CalendarData";
import { parseDateTime, toDateInput } from "../classes/CalendarFunctions";
import { XIcon } from "../icons/CalenderIcons";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import "../css/EventSheetComponent.scss";
import { getRecords, useApiQuery } from "../api/common";
import { getSports, getTimeSlots } from "../api/APIclass";
import { useAuth } from "./AuthManager/AuthContext";
import ThreeDots from "./ThreeDots";

export const EventSheet: FC<EventSheetProps> = ({
  event,
  defaultDate,
  isDesktop,
  onSave,
  onDelete,
  onClose,
}) => {

  const [dateStr, setDateStr] = useState<string>(
    toDateInput(event?.start ?? defaultDate),
  );
  const isEdit = Boolean(event);
  const { user } = useAuth();
  const {data : sports, isLoading: isSportsLoading } = useApiQuery(["sports"],getRecords(getSports));
  const {data : timeSlot, isLoading: isTimeSlotsLoading} = useApiQuery(["timeslots", dateStr],getRecords(getTimeSlots, {date: dateStr}));
  const ALL_SLOTS = timeSlot?.data;

  
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

const isPastEvent: boolean = event?.date && new Date(event.date) < new Date() || false;

useEffect(() => {
 
  if (!user) return;
  if (user.isAdmin) {
    setTitle(""); // or keep existing if needed
  } else {
    setTitle(`${user.firstname} ${user.lastname} - ${user.phone}`);
  }
}, [user]);

  const [title, setTitle] = useState<string>(event?.title ?? "");
  const [color, setColor] = useState<string>(event?.color ?? COLOR_PALETTE[0]);
  const [allDay, setAllDay] = useState<boolean>(event?.allDay ?? false);
  const [recurringEvent, setRecurring] = useState<boolean>(event?.recurringEvent ?? false,);
  const [selectedsport, setSport] = useState<number>(event?.sport ?? 0);
  const [selSlots, setSelSlots] = useState<number[]>(initialSlots);
  const [sportRate, setSportRate] = useState<number>(sports?.data.find((v: SportInterface) => v.id == selectedsport)?.rate ?? 0);

  const toggleSlot = useCallback((hour: number, isbooked: boolean = false) => {
    if(isbooked) return;
    setSelSlots((prev) =>
      prev.includes(hour) ? prev.filter((h) => h !== hour) : [...prev, hour],
    );
  }, []);

  const clearSlots = useCallback(() => setSelSlots([]), []);


  const handleSave = useCallback(() => {
    if (!title.trim()) return;
    let start: Date, end: Date;
    if (allDay || selSlots.length === 0) {
      start = parseDateTime(dateStr, "00:00");
      end = parseDateTime(dateStr, "23:59");
    } else {
      const sorted = [...selSlots].sort((a, b) => a - b);
      const sh = sorted[0];
      const eh = sorted[sorted.length - 1] + 1;
      start = parseDateTime(dateStr, `${String(sh).padStart(2, "0")}:00`);
      end = parseDateTime(dateStr, `${String(eh).padStart(2, "0")}:00`);
    }
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
        : undefined,
      date: parseDateTime(dateStr, `${String(selSlots[selSlots.length - 1] + 1).padStart(2, "0")}:00`),  
      bookingPrice: selSlots.length * sportRate
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
    onSave
  ]);

  /* Sorted selected slots for display */
  const sortedSel = useMemo(
    () => [...selSlots].sort((a, b) => a - b),
    [selSlots],
  );

  return (
    (isSportsLoading || isTimeSlotsLoading) ? ( <div><ThreeDots /></div>) : 
    (<div
      className={`overlay ${isDesktop ? "modal-mode" : ""}`}
      onClick={(e) => e.target === e.currentTarget && onClose()}>
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
          </div>

          <div>
            <div className="field-label">Sport</div>
            <div className="select-wrap">
              <div className="ss-grid">
                {sports?.data.map((sport:SportInterface) => (
                  <button
                    key={sport.id}
                    onClick={() => {setSport(sport.id); setSportRate(sport.rate);}}
                    className={`ss-card${selectedsport === sport.id ? " ss-active" : ""}`}
                    aria-pressed={selectedsport === sport.id}
                    aria-label={sport.sportname}
                    >
                    <span className="ss-icon"><img src={sport.icon}></img></span>
                    <span className="ss-label">{sport.sportname}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div>
            <div className="field-label">Date</div>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                className="cal-input"
                disablePast
                defaultValue={dayjs(dateStr)}
                onChange={(newvalue) =>
                  setDateStr(newvalue ? newvalue.format("YYYY-MM-DD") : "")
                }
              />
            </LocalizationProvider>
          </div>

          <div className="toggle-row">
            <span className="toggle-label">Recurring Event</span>
            <button
              className={`toggle-btn ${recurringEvent ? "on" : ""}`}
              onClick={() => setRecurring((v) => !v)}
            />
          </div>
          <div className="toggle-row">
            <span className="toggle-label">All-day event</span>
            <button
              className={`toggle-btn ${allDay ? "on" : ""}`}
              onClick={() => setAllDay((v) => !v)}
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

              {/* Slot grid grouped by period */}
              {SLOT_PERIODS?.map((period) => (
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
              ))}
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
        { !isPastEvent &&
        <div className="sheet-footer" >
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
        </div>}
      </div>
    </div>)
  );
};
