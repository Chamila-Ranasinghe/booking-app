import { type FC } from "react";
import { type DetailSheetProps } from "../classes/CalendarClass";
import { formatTime } from "../classes/CalendarFunctions";
import { XIcon } from "../icons/CalenderIcons";
import "../css/EventDetailComponent.scss";

export const DetailSheet: FC<DetailSheetProps> = ({
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
        <div className="close-button-event-details">
          <button className="close-btn" onClick={onClose}>
            <XIcon />
          </button>
        </div>
        {!isDesktop && <div className="sheet-handle" />}
        <div
          className="detail-color-strip"
          style={{
            background: event.color + "40",
            borderLeft: `4px solid ${event.color}`,
          }}
        ></div>
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
          <button className="btn btn-primary" onClick={() => onEdit(event)}>
            Edit Event
          </button>
        </div>
        <div style={{ height: 8 }} />
      </div>
    </div>
  );
};
