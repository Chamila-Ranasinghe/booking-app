import { type FC } from "react";
import { type EventCardProps } from "../classes/CalendarClass";
import { formatTime } from "../classes/CalendarFunctions";

export const EventCard: FC<EventCardProps> = ({ event, onPress }) => {
  const timeStr = event.allDay
    ? "All day"
    : `${formatTime(event.start)} – ${formatTime(event.end)}`;
  return (
    <div className="event-card" onClick={() => onPress(event)}>
      <div className="event-bar" style={{ background: event.color }} />
      <div className="event-body">
        <div className="event-title">{event.title}</div>
        <div className="event-time">{timeStr}</div>
      </div>
      {event.allDay && (
        <div
          className="event-badge"
          style={{ background: event.color + "22", color: event.color }}
        >
          All day
        </div>
      )}
    </div>
  );
};
