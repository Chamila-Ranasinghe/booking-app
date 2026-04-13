import { useCallback, useState, useMemo, type FC } from "react";
import { type EventSheetProps } from "../classes/CalendarClass";
import { COLOR_PALETTE, timeSlots } from "../classes/CalendarData";
import { parseDateTime, toDateInput } from "../classes/CalendarFunctions";
import { XIcon } from "../icons/CalenderIcons";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import "../css/EventSheetComponent.scss";

/* All 1-hour slots from 6 AM to 10 PM */
// const ALL_SLOTS: { hour: number; label: string }[] = Array.from(
//   { length: 17 },
//   (_, i) => {
//     const h = i + 6;
//     const fmt = (n: number) => {
//       if (n === 12) return "12 PM";
//       return n < 12 ? `${n} AM` : `${n - 12} PM`;
//     };
//     return { hour: h, label: `${fmt(h)} – ${fmt(h + 1)}` };
//   },
// );

const ALL_SLOTS = timeSlots;

const SLOT_PERIODS = [
  {
    label: "Morning",
    slots: ALL_SLOTS.filter((s) => s.timePeriod == 1),
  },
  {
    label: "Afternoon",
    slots: ALL_SLOTS.filter((s) => s.timePeriod == 2),
  },
  {
    label: "Evening",
    slots: ALL_SLOTS.filter((s) => s.timePeriod == 3),
  },
];

function formatSlotLabel(id: number): string {
  // const fmt = (n: number) => {
  //   if (n === 12) return "12 PM";
  //   return n < 12 ? `${n} AM` : `${n - 12} PM`;
  // };
  // return `${fmt(hour)} – ${fmt(hour + 1)}`;
  return ALL_SLOTS.find(u => u.id == id)?.label || "";
}

export const EventSheet: FC<EventSheetProps> = ({
  event,
  defaultDate,
  isDesktop,
  onSave,
  onDelete,
  onClose,
}) => {
  const isEdit = Boolean(event);

  // Derive initial slots from existing event start/end hours
  // used for the editing event, which already have slots booked --> need to change  
  const initialSlots = useMemo<number[]>(() => {
    if (!event || event.allDay) return [];
    const sh = event.start.getHours();
    const eh = event.end.getHours();
    const slots: number[] = [];
    for (let h = sh; h < eh; h++) slots.push(h);
    return slots.filter((h) => h >= 6 && h <= 22);
  }, [event]);

  const [title, setTitle] = useState<string>(event?.title ?? "");
  const [color, setColor] = useState<string>(event?.color ?? COLOR_PALETTE[0]);
  const [allDay, setAllDay] = useState<boolean>(event?.allDay ?? false);
  const [recurringEvent, setRecurring] = useState<boolean>(
    event?.recurringEvent ?? false,
  );
  const [sport, setSport] = useState<string>(event?.sport ?? "");
  const [dateStr, setDateStr] = useState<string>(
    toDateInput(event?.start ?? defaultDate),
  );

  // const [startT, setStartT] = useState<string>(toTimeInput(event?.start ?? new Date()),);
  // const [endT, setEndT] = useState<string>(toTimeInput(event?.end ?? new Date()),);
  const [selSlots, setSelSlots] = useState<number[]>(initialSlots);

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
      sport: sport || undefined,
      timeSlots: selSlots.length
        ? [...selSlots].sort((a, b) => a - b)
        : undefined,
    });
  }, [
    title,
    allDay,
    dateStr,
    selSlots,
    color,
    sport,
    recurringEvent,
    event,
    onSave,
  ]);

  /* Sorted selected slots for display */
  const sortedSel = useMemo(
    () => [...selSlots].sort((a, b) => a - b),
    [selSlots],
  );
  const SPORT_LIST: string[] = ["Football", "Cricket", "Yoga", "Zumba"];

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
            {isEdit ? "Edit Booking" : "New Booking"}
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
            <div className="field-label">Sport</div>
            <div className="select-wrap">
              <select
                className="cal-input"
                value={sport}
                onChange={(e) => setSport(e.target.value)}
              >
                <option value="">— Select sport —</option>
                {SPORT_LIST.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              <div className="select-arrow">
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
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
            {/* <input
              type="date"
              className="cal-input"
              value={dateStr}
              min={new Date().toISOString().split("T")[0]}
              onChange={(e) => setDateStr(e.target.value)}
            /> */}
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
              {SLOT_PERIODS.map((period) => (
                <div key={period.label}>
                  <div className="slot-period-label">{period.label}</div>
                  <div className="slot-grid">
                    {period.slots.map(({ id, label, isbooked }) => (
                      <div
                        key={id}
                        className={`slot-pill ${selSlots.includes(id) ? "slot-selected" : isbooked ? "booked" : ""}`}
                        onClick={() => toggleSlot(id, isbooked)}
                      >
                        {label}
                      </div>
                    ))}
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
            {selSlots.length} slots / Total: LKR {selSlots.length * 2500.0}.00
          </span>
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
          <button className="btn btn-primary" onClick={handleSave}>
            {isEdit ? "Save Changes" : "Book"}
          </button>
        </div>
      </div>
    </div>
  );
};
