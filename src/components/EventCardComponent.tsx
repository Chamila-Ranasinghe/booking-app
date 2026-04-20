import { type FC } from "react";
import { BookingStatus, type EventCardProps } from "../classes/CalendarClass";
import { EventCardChevronRightIcon } from "../icons/CalenderIcons";
import "../css/EventCardComponent.scss";
import { getRecords, useApiQuery } from "../api/common";
import { getTimeSlots } from "../api/APIclass";
import { Facebook } from 'react-content-loader'

export const EventCard: FC<EventCardProps> = ({ event, onPress }) => {
  const timeRange: string[] = [];
  const { data: timeSlot, isLoading } = useApiQuery(
    ["timeslots"],
    getRecords(getTimeSlots, {date: new Date().toISOString().split("T")[0]}),
  );

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
    isLoading? <> <Facebook /> </> : 
    <div className="event-card" onClick={() => onPress(event)}>
      <div className="event-bar" style={{ background: event.color }} />
      <div className="event-body">
        <div className="clientname">
          {event.fullName} - {event?.phone}
          <div>
            {
              event.status == BookingStatus.PENDING ? (<div
              className="event-badge"
              style={{ background: event.color + "22", color: event.color }}
            >
              PENDING
            </div> ) : 
            event.status == BookingStatus.CONFIRMED ? 
            (<div
              className="event-badge"
              style={{ background: event.color + "22", color: event.color }}
            >
              CONFIRMED
            </div> ) : 
            (<div
              className="event-badge"
              style={{ background: event.color + "22", color: event.color }}
            >
              DELETED
            </div> )
            }
            
          </div>
        </div>
        <div className="event-detail-card">
          <div className="event-title">{event.sportName} ({timeRange.length}hrs) - </div>
          <div className="event-time">
            {timeRange[timeRange.length - 1]} <span style={{ color: event.color }}> / </span> {timeRange[0]}
          </div>
        </div>
        <div className="price-tag">Rs.{event.bookingPrice}.00</div>
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
