import { type FC } from "react";
import { BookingStatus, type DetailSheetProps } from "../classes/CalendarClass";
import { XIcon } from "../icons/CalenderIcons";
import "../css/EventDetailComponent.scss";
import { useAuth } from "./AuthManager/AuthContext";
import { getRecords, useApiQuery } from "../api/common";
import { getTimeSlots } from "../api/APIclass";

export const DetailSheet: FC<DetailSheetProps> = ({
  event,
  isDesktop,
  onEdit,
  onDelete,
  onClose,
  onConfirm,
}) => {
  const { user } = useAuth();
  const { data: timeSlot} = useApiQuery(
    ["timeslots"],
    getRecords(getTimeSlots),
  );
  const isPastEvent: boolean = event?.date && new Date(event.date).setHours(0, 0, 0, 0) < new Date().setHours(0, 0, 0, 0) || false;
  const timeRange: string[] = [];
  if (timeSlot?.data) {
    event.timeSlots?.forEach((time) => {
      let timestring =
        timeSlot.data?.find((u: any) => u.id == Number(time))?.timeSlotName ||
        "";
      if (timestring) {
        timeRange.push(timestring);
      }
    });
  }

  // const timeStr = event.allDay
  //   ? "All day"
  //   : `${formatTime(event.start)} – ${formatTime(event.end)}`;

  return (
    <div
      className={`overlay ${isDesktop ? "modal-mode" : ""}`}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className={isDesktop ? "modal" : "modal"}>
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
            borderLeft: `50px solid ${event.color}`,
          }}
        ></div>
        <div className="detail-title">{event.title}</div>
        <div className="detail-time"> {timeRange[timeRange.length - 1]} <span style={{ color: event.color }}> / </span> {timeRange[0]}</div>
        <div className="sheet-footer">
          {(!isPastEvent && event.status != BookingStatus.CONFIRMED) &&<button
            className="btn btn-danger"
            onClick={() => {
              onDelete(event.id);
              onClose();
            }}
          >
            Delete
          </button>}
          <button className="btn btn-primary" onClick={() => onEdit(event)}>
            {(isPastEvent || event.status == BookingStatus.CONFIRMED)?  "View":  "Edit"}
          </button>
          { (user?.isAdmin && !isPastEvent && event.status != BookingStatus.CONFIRMED) && <button className="btn btn-secondary" onClick={() => onConfirm(event)}>
            Confirm
          </button>
          }
        </div>
        <div style={{ height: 8 }} />
      </div>
    </div>
  );
};
