import { type FC } from "react";
import { type EventCardProps } from "../classes/CalendarClass";
import { formatTime } from "../classes/CalendarFunctions";
import {
  EventCardChevronRightIcon,
} from "../icons/CalenderIcons";
import "../css/EventCardComponent.scss";

export const EventCard: FC<EventCardProps> = ({ event, onPress }) => {
  const timeStr = event.allDay
    ? "All day"
    : `${formatTime(event.start)} – ${formatTime(event.end)}`;
  return (
    <div className="event-card" onClick={() => onPress(event)}>
      <div className="event-bar" style={{ background: event.color }} />
      <div className="event-body">
        <div className="clientname">
          Ramesh - (0713325743){" "}
          <div>
            <div
              className="event-badge"
              style={{ background: event.color + "22", color: event.color }}
            >
              Confirmed
            </div>
          </div>
        </div>
        <div className="event-detail-card">
          <div className="event-title">Cricket - </div>
          <div className="event-time">{timeStr}</div>
        </div>
        <div className="price-tag">LKR 5,000.00</div>
      </div>
      {event.allDay && (
        <div
          className="event-badge"
          style={{ background: event.color + "22", color: event.color }}
        >
          All day
        </div>
      )}

      <div className="event-card-chevron-icon">
        <EventCardChevronRightIcon />
      </div>
    </div>
  );
};
