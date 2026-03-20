import { useCallback, useState, type FC } from "react";
import { type EventSheetProps } from "../classes/CalendarClass";
import { COLOR_PALETTE } from "../classes/CalendarData";
import {
  parseDateTime,
  toDateInput,
  toTimeInput,
} from "../classes/CalendarFunctions";
import { XIcon } from "../icons/CalenderIcons";

export const EventSheet: FC<EventSheetProps> = ({
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
  const [recurringEvent, setRecurring] = useState<boolean>(
    event?.recurringEvent ?? false,
  );
  const [sport, setSport] = useState<string>(event?.sport ?? "");
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
    onSave({
      id: event?.id,
      title: title.trim(),
      start,
      end,
      color,
      allDay,
      recurringEvent,
      sport,
    });
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
            <div className="field-label">Sport</div>
            <select
              value={sport}
              className="cal-input"
              onChange={(e) => setSport(e.target.value)}
            >
              <option value="">Select</option>
              <option value="football">Football</option>
              <option value="cricket">Cricket</option>
              <option value="tennis">Tennis</option>
            </select>
            <p>Selected: {sport}</p>
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
