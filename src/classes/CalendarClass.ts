export interface CalendarEvent {
  id: number;
  title: string;
  start: Date;
  end: Date;
  color: string;
  allDay: boolean;
  recurringEvent: boolean;
  sport?: string;
  timeSlots?: number[];
}

export interface DayCell {
  date: Date;
  currentMonth: boolean;
}

type SheetMode = "add" | "edit" | "detail";
export interface SheetState {
  mode: SheetMode;
  event?: CalendarEvent;
}

export interface MonthGridProps {
  year: number;
  month: number;
  events: CalendarEvent[];
  selectedDay: Date | null;
  onSelectDay: (date: Date) => void;
  slideClass: string;
  isDesktop: boolean;
}

export interface DetailSheetProps {
  event: CalendarEvent;
  isDesktop: boolean;
  onEdit: (ev: CalendarEvent) => void;
  onDelete: (id: number) => void;
  onClose: () => void;
}

export interface EventCardProps {
  event: CalendarEvent;
  onPress: (ev: CalendarEvent) => void;
}

export interface AgendaProps {
  events: CalendarEvent[];
  year: number;
  month: number;
  selectedDay: Date | null;
  onEventPress: (ev: CalendarEvent) => void;
  onClearDay: () => void;
  agendaRef: React.RefObject<HTMLDivElement | null>;
  isDesktop: boolean;
}

export interface EventSheetProps {
  event?: CalendarEvent;
  defaultDate: Date;
  isDesktop: boolean;
  onSave: (data: Omit<CalendarEvent, "id"> & { id?: number }) => void;
  onDelete: (id: number) => void;
  onClose: () => void;
}

export interface User {
  id?: number;
  email?: string;
  firstname?: string;
  lastname?: string;
  phone?: number;
  userType?: string;
  regDate?: string;
  isAdmin?: boolean;
}
