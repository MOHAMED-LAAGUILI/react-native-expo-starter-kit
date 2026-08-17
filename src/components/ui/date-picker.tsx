import type { ReactNode } from 'react';
import type { TextStyle, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ArrowRight,
  Calendar,
  CalendarClock,
  CalendarRange,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock,
} from 'lucide-react-native';
import { useState } from 'react';
import { FlatList, Pressable, View } from 'react-native';
import { useThemeColors } from '@/hooks/use-theme-color';
import { cn } from '@/utils/utils';
import { BottomSheet } from './bottom-sheet';
import { Button } from './button';
import { Text } from './text';

export type DateRange = {
  startDate: Date | null;
  endDate: Date | null;
};

// Conditional typing based on mode
type BaseDatePickerProps = {
  label?: string;
  error?: string;
  placeholder?: string;
  disabled?: boolean;
  style?: ViewStyle;
  minimumDate?: Date;
  maximumDate?: Date;
  timeFormat?: '12' | '24';
  variant?: 'filled' | 'outline' | 'group';
  labelStyle?: TextStyle;
  errorStyle?: TextStyle;
};

type DatePickerPropsRange = BaseDatePickerProps & {
  mode: 'range';
  value?: DateRange;
  onChange?: (value: DateRange | undefined) => void;
};

type DatePickerPropsDate = BaseDatePickerProps & {
  mode?: 'date' | 'time' | 'datetime';
  value?: Date;
  onChange?: (value: Date | undefined) => void;
};

export type DatePickerProps = DatePickerPropsRange | DatePickerPropsDate;

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// Generate year range (current year ± 50 years)
const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 101 }, (_, i) => currentYear - 50 + i);

type CalendarData = {
  weeks: (number | null)[][];
  year: number;
  month: number;
  daysInMonth: number;
};

type NavigationState = {
  currentDate: Date;
  viewMode: 'date' | 'time';
  showMonthPicker: boolean;
  showYearPicker: boolean;
  navigateMonth: (direction: 'prev' | 'next') => void;
  handleMonthSelect: (monthIndex: number) => void;
  handleYearSelect: (year: number) => void;
  handleTimeChange: (hours: number, minutes: number) => void;
  setCurrentDate: (date: Date) => void;
  setViewMode: (mode: 'date' | 'time') => void;
  setShowMonthPicker: (visible: boolean) => void;
  setShowYearPicker: (visible: boolean) => void;
};

type SelectionState = {
  tempRange: DateRange;
  handleDateSelect: (day: number) => void;
  handleConfirm: () => void;
  resetToToday: () => void;
  clearSelection: () => void;
  handleCancel: () => void;
};

// Type guard to check if value is DateRange
function isDateRange(value: Date | DateRange | undefined): value is DateRange {
  return (
    value !== undefined
    && typeof value === 'object'
    && value !== null
    && 'startDate' in value
    && 'endDate' in value
  );
}

function getInitialDate(value: Date | DateRange | undefined, mode: string): Date {
  if (mode === 'range') {
    const rangeValue = isDateRange(value)
      ? value
      : { startDate: null, endDate: null };
    return rangeValue.startDate || new Date();
  }
  return (value as Date | undefined) || new Date();
}

function getInitialRange(value: Date | DateRange | undefined, mode: string): DateRange {
  return mode === 'range' && isDateRange(value)
    ? value
    : { startDate: null, endDate: null };
}

function formatDisplayValue({
  value,
  mode,
  placeholder,
  timeFormat,
}: {
  value: Date | DateRange | undefined;
  mode: string;
  placeholder: string;
  timeFormat: '12' | '24';
}): string {
  if (mode === 'range') {
    const rangeValue = isDateRange(value)
      ? value
      : { startDate: null, endDate: null };

    if (!rangeValue.startDate && !rangeValue.endDate)
      return placeholder;

    const startStr = rangeValue.startDate
      ? rangeValue.startDate.toLocaleDateString()
      : '';
    const endStr = rangeValue.endDate
      ? rangeValue.endDate.toLocaleDateString()
      : '';

    if (startStr && endStr)
      return `${startStr} - ${endStr}`;
    else if (startStr)
      return `${startStr} - Select end date`;
    else if (endStr)
      return `Select start date - ${endStr}`;
    return placeholder;
  }

  const dateValue = value as Date | undefined;
  if (!dateValue)
    return placeholder;

  const timeStr
    = timeFormat === '12'
      ? dateValue.toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
        })
      : dateValue.toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        });

  switch (mode) {
    case 'time':
      return timeStr;
    case 'datetime':
      return `${dateValue.toLocaleDateString()} ${timeStr}`;
    default:
      return dateValue.toLocaleDateString();
  }
}

function isDateDisabled(date: Date, minimumDate?: Date, maximumDate?: Date): boolean {
  if (minimumDate && date < minimumDate)
    return true;
  if (maximumDate && date > maximumDate)
    return true;
  return false;
}

function isDateInRange(date: Date, mode: string, tempRange: DateRange): boolean {
  if (mode !== 'range' || !tempRange.startDate || !tempRange.endDate)
    return false;

  // Create new date objects to avoid mutation
  const startDate = new Date(tempRange.startDate);
  const endDate = new Date(tempRange.endDate);
  const checkDate = new Date(date);

  // Normalize dates for comparison (remove time)
  startDate.setHours(0, 0, 0, 0);
  endDate.setHours(0, 0, 0, 0);
  checkDate.setHours(0, 0, 0, 0);

  return checkDate >= startDate && checkDate <= endDate;
}

function isRangeEndpoint(
  date: Date,
  mode: string,
  tempRange: DateRange,
): { isStart: boolean; isEnd: boolean } {
  if (mode !== 'range')
    return { isStart: false, isEnd: false };

  const normalizedDate = new Date(date);
  normalizedDate.setHours(0, 0, 0, 0);

  const isStart
    = tempRange.startDate
      && new Date(tempRange.startDate).setHours(0, 0, 0, 0)
      === normalizedDate.getTime();
  const isEnd
    = tempRange.endDate
      && new Date(tempRange.endDate).setHours(0, 0, 0, 0)
      === normalizedDate.getTime();

  return { isStart: !!isStart, isEnd: !!isEnd };
}

function buildCalendarData(currentDate: Date): CalendarData {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Get first day of month and number of days
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Create calendar grid with proper positioning
  const weeks: (number | null)[][] = [];
  let currentWeek: (number | null)[] = [];

  // Fill empty cells for days before month starts
  for (let i = 0; i < firstDay; i++) {
    currentWeek.push(null);
  }

  // Add days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    currentWeek.push(day);

    // If week is complete (7 days) or it's the last day, start a new week
    if (currentWeek.length === 7) {
      weeks.push([...currentWeek]);
      currentWeek = [];
    }
  }

  // Add the last incomplete week if it exists
  if (currentWeek.length > 0) {
    // Fill remaining cells with null
    while (currentWeek.length < 7) {
      currentWeek.push(null);
    }
    weeks.push(currentWeek);
  }

  return { weeks, year, month, daysInMonth };
}

function getBottomSheetTitle({
  mode,
  viewMode,
  showMonthPicker,
  showYearPicker,
}: {
  mode: string;
  viewMode: 'date' | 'time';
  showMonthPicker: boolean;
  showYearPicker: boolean;
}): string {
  if (showMonthPicker)
    return 'Select Month';
  if (showYearPicker)
    return 'Select Year';

  if (mode === 'datetime')
    return viewMode === 'date' ? 'Select Date' : 'Select Time';

  if (mode === 'time')
    return 'Select Time';

  if (mode === 'range')
    return 'Select Range';

  return 'Select Date';
}

function createDayDate(currentDate: Date, day: number): Date {
  return new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    day,
  );
}

function updateRangeSelection(
  tempRange: DateRange,
  selectedDate: Date,
  options: { minimumDate?: Date; maximumDate?: Date },
): DateRange {
  const { minimumDate, maximumDate } = options;

  if (isDateDisabled(selectedDate, minimumDate, maximumDate))
    return tempRange;

  if (!tempRange.startDate || tempRange.endDate) {
    return { startDate: selectedDate, endDate: null };
  }

  if (selectedDate < tempRange.startDate) {
    return { startDate: selectedDate, endDate: null };
  }

  return { startDate: tempRange.startDate, endDate: selectedDate };
}

function getTodayWithTime(today: Date): Date {
  const now = new Date();
  const result = new Date(today);
  result.setHours(now.getHours(), now.getMinutes(), 0, 0);
  return result;
}

function useNavigationState(value: Date | DateRange | undefined, mode: string): NavigationState {
  const [currentDate, setCurrentDate] = useState(() => getInitialDate(value, mode));
  const [viewMode, setViewMode] = useState<'date' | 'time'>('date');
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [showYearPicker, setShowYearPicker] = useState(false);

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1);
    }
    else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };

  const handleMonthSelect = (monthIndex: number) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(monthIndex);
    setCurrentDate(newDate);
    setShowMonthPicker(false);
  };

  const handleYearSelect = (year: number) => {
    const newDate = new Date(currentDate);
    newDate.setFullYear(year);
    setCurrentDate(newDate);
    setShowYearPicker(false);
  };

  const handleTimeChange = (hours: number, minutes: number) => {
    const newDate = new Date(currentDate);
    newDate.setHours(hours, minutes, 0, 0);
    setCurrentDate(newDate);
  };

  return {
    currentDate,
    viewMode,
    showMonthPicker,
    showYearPicker,
    navigateMonth,
    handleMonthSelect,
    handleYearSelect,
    handleTimeChange,
    setCurrentDate,
    setViewMode,
    setShowMonthPicker,
    setShowYearPicker,
  };
}

function useSelectionState({
  value,
  mode,
  onChange,
  minimumDate,
  maximumDate,
  navigation,
  setIsOpen,
}: {
  value: Date | DateRange | undefined;
  mode: string;
  onChange: DatePickerProps['onChange'];
  minimumDate?: Date;
  maximumDate?: Date;
  navigation: NavigationState;
  setIsOpen: (open: boolean) => void;
}): SelectionState {
  const [tempRange, setTempRange] = useState<DateRange>(() =>
    getInitialRange(value, mode),
  );

  const handleRangeSelect = (day: number) => {
    const selectedDate = createDayDate(navigation.currentDate, day);
    setTempRange(
      updateRangeSelection(tempRange, selectedDate, { minimumDate, maximumDate }),
    );
  };

  const handleDateSelect = (day: number) => {
    if (mode === 'range') {
      handleRangeSelect(day);
      return;
    }

    const newDate = createDayDate(navigation.currentDate, day);

    if (isDateDisabled(newDate, minimumDate, maximumDate))
      return;

    navigation.setCurrentDate(newDate);

    if (mode === 'date') {
      (onChange as (value: Date | undefined) => void)?.(newDate);
      setIsOpen(false);
    }
    else if (mode === 'datetime') {
      navigation.setViewMode('time');
    }
  };

  const handleConfirm = () => {
    if (mode === 'range') {
      (onChange as (value: DateRange | undefined) => void)?.(tempRange);
    }
    else {
      (onChange as (value: Date | undefined) => void)?.(navigation.currentDate);
    }
    setIsOpen(false);
  };

  const resetToToday = () => {
    const today = new Date();

    if (mode === 'range') {
      navigation.setCurrentDate(today);
      setTempRange({ startDate: today, endDate: null });
      return;
    }

    if (mode === 'datetime') {
      const todayAtNow = getTodayWithTime(today);
      navigation.setCurrentDate(todayAtNow);
      (onChange as (value: Date | undefined) => void)?.(todayAtNow);
      setIsOpen(false);
      return;
    }

    navigation.setCurrentDate(today);
    (onChange as (value: Date | undefined) => void)?.(today);
    setIsOpen(false);
  };

  const clearSelection = () => {
    if (mode === 'range') {
      setTempRange({ startDate: null, endDate: null });
      (onChange as (value: DateRange | undefined) => void)?.(undefined);
    }
    else {
      (onChange as (value: Date | undefined) => void)?.(undefined);
    }
  };

  const handleCancel = () => {
    navigation.setShowMonthPicker(false);
    navigation.setShowYearPicker(false);
    clearSelection();
    setIsOpen(false);
  };

  return {
    tempRange,
    handleDateSelect,
    handleConfirm,
    resetToToday,
    clearSelection,
    handleCancel,
  };
}

type CalendarHeaderProps = {
  month: string;
  year: number;
  textColor: string;
  onPrev: () => void;
  onNext: () => void;
  onOpenMonth: () => void;
  onOpenYear: () => void;
};

function CalendarHeader({
  month,
  year,
  textColor,
  onPrev,
  onNext,
  onOpenMonth,
  onOpenYear,
}: CalendarHeaderProps) {
  return (
    <View className="mb-6 flex-row items-center justify-between px-2">
      <Pressable
        onPress={onPrev}
        style={({ pressed }) => pressed && { opacity: 0.2 }}
        className="bg-secondary rounded-full p-2.5"
      >
        <ChevronLeft size={20} color={textColor} />
      </Pressable>

      <View className="mx-3 flex-1 flex-row items-center justify-center gap-3">
        <Pressable
          onPress={onOpenMonth}
          style={({ pressed }) => pressed && { opacity: 0.2 }}
          className="bg-secondary flex-1 flex-row items-center justify-center rounded-full px-3 py-2.5"
        >
          <Text variant="bodyLarge" className="mr-1">
            {month}
          </Text>
          <ChevronDown size={16} color={textColor} />
        </Pressable>

        <Pressable
          onPress={onOpenYear}
          style={({ pressed }) => pressed && { opacity: 0.2 }}
          className="bg-secondary flex-1 flex-row items-center justify-center rounded-full px-4 py-2.5"
        >
          <Text variant="bodyLarge" className="mr-1">
            {year}
          </Text>
          <ChevronDown size={16} color={textColor} />
        </Pressable>
      </View>

      <Pressable
        onPress={onNext}
        style={({ pressed }) => pressed && { opacity: 0.2 }}
        className="bg-secondary rounded-full p-2.5"
      >
        <ChevronRight size={20} color={textColor} />
      </Pressable>
    </View>
  );
}

type RangeSummaryProps = {
  tempRange: DateRange;
  textColor: string;
};

function RangeSummary({ tempRange, textColor }: RangeSummaryProps) {
  return (
    <View className="bg-secondary mt-4 flex-row items-center justify-between rounded-xl px-9 py-5">
      <Text variant="body" className="flex-1">
        {tempRange.startDate
          ? `${tempRange.startDate.toLocaleDateString()}`
          : 'Start date'}
      </Text>

      <View className="flex-1 items-center justify-center">
        <ArrowRight color={textColor} strokeWidth={3} />
      </View>

      <Text variant="body" className="flex-1 text-right">
        {tempRange.endDate
          ? `${tempRange.endDate.toLocaleDateString()}`
          : 'End date'}
      </Text>
    </View>
  );
}

type CalendarDayCellProps = {
  day: number | null;
  year: number;
  month: number;
  mode: string;
  value?: Date | DateRange;
  tempRange: DateRange;
  minimumDate?: Date;
  maximumDate?: Date;
  onSelectDay: (day: number) => void;
};

function CalendarDayCell({
  day,
  year,
  month,
  mode,
  value,
  tempRange,
  minimumDate,
  maximumDate,
  onSelectDay,
}: CalendarDayCellProps) {
  const dayDate = day ? new Date(year, month, day) : null;

  const isSelected
    = day
      && value
      && !isDateRange(value)
      && value.getDate() === day
      && value.getMonth() === month
      && value.getFullYear() === year;

  const [today] = useState(() => new Date());
  const isToday
    = day
      && today.getDate() === day
      && today.getMonth() === month
      && today.getFullYear() === year;

  const disabled = dayDate
    ? isDateDisabled(dayDate, minimumDate, maximumDate)
    : false;

  const inRange = dayDate
    ? isDateInRange(dayDate, mode, tempRange)
    : false;
  const rangeEndpoints = dayDate
    ? isRangeEndpoint(dayDate, mode, tempRange)
    : { isStart: false, isEnd: false };

  const isEndpoint = rangeEndpoints.isStart || rangeEndpoints.isEnd;
  const isActive = isEndpoint || inRange || isSelected;

  return (
    <View
      className={cn(
        'flex-1 items-center',
        mode === 'range' && inRange && 'bg-secondary',
        rangeEndpoints.isStart && 'rounded-l-lg',
        rangeEndpoints.isEnd && 'rounded-r-lg',
      )}
    >
      {day
        ? (
            <Pressable
              onPress={() => !disabled && onSelectDay(day)}
              disabled={disabled}
              style={({ pressed }) => pressed && { opacity: 0.2 }}
              className={cn(
                'size-10 items-center justify-center',
                isActive && 'bg-secondary',
                isSelected && 'bg-foreground',
                isEndpoint ? 'rounded-none' : 'rounded-full',
                isToday && !isSelected && !inRange
                && 'border-primary border',
                disabled && 'opacity-30',
              )}
            >
              <Text
                className={cn(
                  isSelected
                    ? 'text-background'
                    : isActive
                      ? 'text-foreground'
                      : disabled
                        ? 'text-muted-foreground'
                        : 'text-foreground',
                  (isEndpoint || isSelected || isToday)
                  && 'font-semibold',
                )}
              >
                {day}
              </Text>
            </Pressable>
          )
        : (
            <View className="size-10" />
          )}
    </View>
  );
}

type CalendarGridProps = {
  calendarData: CalendarData;
  mode: string;
  value?: Date | DateRange;
  tempRange: DateRange;
  minimumDate?: Date;
  maximumDate?: Date;
  onSelectDay: (day: number) => void;
};

function CalendarGrid({
  calendarData,
  mode,
  value,
  tempRange,
  minimumDate,
  maximumDate,
  onSelectDay,
}: CalendarGridProps) {
  return (
    <>
      <View className="mb-3 flex-row px-1">
        {DAYS.map(day => (
          <View key={day} className="flex-1 items-center">
            <Text variant="caption" className="text-xs font-semibold">
              {day}
            </Text>
          </View>
        ))}
      </View>

      <View className="px-1">
        {calendarData.weeks.map((week) => {
          const weekKey = week.find(day => day !== null) ?? 'empty-week';
          return (
            <View
              key={weekKey}
              className="mb-1 flex-row"
            >
              {DAYS.map((dayName) => {
                const day = week[DAYS.indexOf(dayName)] ?? null;
                return (
                  <CalendarDayCell
                    key={day ?? `${weekKey}-${dayName}`}
                    day={day}
                    year={calendarData.year}
                    month={calendarData.month}
                    mode={mode}
                    value={value}
                    tempRange={tempRange}
                    minimumDate={minimumDate}
                    maximumDate={maximumDate}
                    onSelectDay={onSelectDay}
                  />
                );
              })}
            </View>
          );
        })}
      </View>
    </>
  );
}

type CalendarViewProps = {
  calendarData: CalendarData;
  mode: string;
  value?: Date | DateRange;
  tempRange: DateRange;
  minimumDate?: Date;
  maximumDate?: Date;
  textColor: string;
  onNavigateMonth: (direction: 'prev' | 'next') => void;
  onOpenMonthPicker: () => void;
  onOpenYearPicker: () => void;
  onSelectDay: (day: number) => void;
};

function CalendarView({
  calendarData,
  mode,
  value,
  tempRange,
  minimumDate,
  maximumDate,
  textColor,
  onNavigateMonth,
  onOpenMonthPicker,
  onOpenYearPicker,
  onSelectDay,
}: CalendarViewProps) {
  return (
    <View>
      <CalendarHeader
        month={MONTHS[calendarData.month]}
        year={calendarData.year}
        textColor={textColor}
        onPrev={() => onNavigateMonth('prev')}
        onNext={() => onNavigateMonth('next')}
        onOpenMonth={onOpenMonthPicker}
        onOpenYear={onOpenYearPicker}
      />

      <CalendarGrid
        calendarData={calendarData}
        mode={mode}
        value={value}
        tempRange={tempRange}
        minimumDate={minimumDate}
        maximumDate={maximumDate}
        onSelectDay={onSelectDay}
      />

      {mode === 'range' && (
        <RangeSummary tempRange={tempRange} textColor={textColor} />
      )}
    </View>
  );
}

type TimeOption = {
  value: number;
  label: string;
};

type TimeColumnProps = {
  title: string;
  options: TimeOption[];
  selectedValue: number;
  onSelect: (value: number) => void;
};

function TimeColumn({
  title,
  options,
  selectedValue,
  onSelect,
}: TimeColumnProps) {
  return (
    <View className="flex-1">
      <Text variant="caption" className="mb-3 text-center">
        {title}
      </Text>
      <FlatList
        data={options}
        keyExtractor={option => String(option.value)}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingVertical: 20,
        }}
        renderItem={({ item: option }) => (
          <Pressable
            onPress={() => onSelect(option.value)}
            className={cn(
              'my-0.5 items-center rounded-full px-4 py-3',
              option.value === selectedValue && 'bg-foreground',
            )}
          >
            <Text
              className={cn(
                option.value === selectedValue
                  ? 'font-semibold text-background'
                  : 'text-foreground',
              )}
            >
              {option.label}
            </Text>
          </Pressable>
        )}
      />
    </View>
  );
}

type PeriodPickerProps = {
  isPM: boolean;
  onSelectPeriod: (isAM: boolean) => void;
};

function PeriodPicker({ isPM, onSelectPeriod }: PeriodPickerProps) {
  return (
    <View className="flex-[0.5]">
      <Text variant="caption" className="mb-3 text-center">
        Period
      </Text>
      <View className="gap-2 py-5">
        {['AM', 'PM'].map((period) => {
          const isAM = period === 'AM';
          const isSelected = isAM ? !isPM : isPM;

          return (
            <Pressable
              key={period}
              onPress={() => onSelectPeriod(isAM)}
              className={cn(
                'items-center rounded-full px-4 py-3',
                isSelected && 'bg-foreground',
              )}
            >
              <Text
                className={cn(
                  isSelected
                    ? 'font-semibold text-background'
                    : 'text-foreground',
                )}
              >
                {period}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

type TimePickerViewProps = {
  currentDate: Date;
  timeFormat: '12' | '24';
  onTimeChange: (hours: number, minutes: number) => void;
};

function TimePickerView({
  currentDate,
  timeFormat,
  onTimeChange,
}: TimePickerViewProps) {
  const selectedHours = currentDate.getHours();
  const selectedMinutes = currentDate.getMinutes();

  const isPM = selectedHours >= 12;

  const hourOptions = Array.from(
    { length: timeFormat === '12' ? 12 : 24 },
    (_, i) => {
      const displayHour = timeFormat === '12' ? (i === 0 ? 12 : i) : i;
      const actualHour
        = timeFormat === '12'
          ? displayHour === 12
            ? isPM
              ? 12
              : 0
            : isPM
              ? displayHour + 12
              : displayHour
          : displayHour;
      return {
        value: actualHour,
        label: displayHour.toString().padStart(2, '0'),
      };
    },
  );

  const minuteOptions = Array.from({ length: 12 }, (_, i) => ({
    value: i * 5,
    label: (i * 5).toString().padStart(2, '0'),
  }));

  const selectPeriod = (isAM: boolean) => {
    const newHours = isAM
      ? selectedHours >= 12
        ? selectedHours - 12
        : selectedHours
      : selectedHours < 12
        ? selectedHours + 12
        : selectedHours;
    onTimeChange(newHours, selectedMinutes);
  };

  return (
    <View className="h-75">
      <View className="flex-1 flex-row gap-4">
        <TimeColumn
          title="Hours"
          options={hourOptions}
          selectedValue={selectedHours}
          onSelect={hour => onTimeChange(hour, selectedMinutes)}
        />

        <TimeColumn
          title="Minutes"
          options={minuteOptions}
          selectedValue={selectedMinutes}
          onSelect={minute => onTimeChange(selectedHours, minute)}
        />

        {timeFormat === '12' && (
          <PeriodPicker isPM={isPM} onSelectPeriod={selectPeriod} />
        )}
      </View>
    </View>
  );
}

type ListPickerViewProps = {
  selectedIndex: number;
  onSelect: (index: number) => void;
};

function MonthPickerView({ selectedIndex, onSelect }: ListPickerViewProps) {
  return (
    <View className="h-75">
      <FlatList
        data={MONTHS}
        keyExtractor={month => month}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingVertical: 20,
        }}
        style={{
          boxShadow: '0px 2px 26px rgba(0, 0, 0, 0.04)',
        }}
        renderItem={({ item: month, index }) => (
          <Pressable
            onPress={() => onSelect(index)}
            className={cn(
              'my-0.5 items-center rounded-full px-5 py-4',
              index === selectedIndex && 'bg-foreground',
            )}
          >
            <Text
              className={cn(
                index === selectedIndex
                  ? 'font-semibold text-background'
                  : 'text-foreground',
              )}
            >
              {month}
            </Text>
          </Pressable>
        )}
      />

      <LinearGradient
        pointerEvents="none"
        colors={['rgba(0,0,0,0.07)', 'transparent']}
        className="absolute inset-x-0 top-0 h-12"
      />
      <LinearGradient
        pointerEvents="none"
        colors={['transparent', 'rgba(0,0,0,0.07)']}
        className="absolute inset-x-0 bottom-0 h-12"
      />
    </View>
  );
}

function YearPickerView({ selectedIndex, onSelect }: ListPickerViewProps) {
  return (
    <View className="h-75">
      <FlatList
        data={YEARS}
        keyExtractor={year => String(year)}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingVertical: 20,
        }}
        style={{
          boxShadow: '0px 2px 26px rgba(0, 0, 0, 0.04)',
        }}
        renderItem={({ item: year }) => (
          <Pressable
            onPress={() => onSelect(year)}
            className={cn(
              'my-0.5 items-center rounded-full px-5 py-4',
              year === selectedIndex && 'bg-foreground',
            )}
          >
            <Text
              className={cn(
                year === selectedIndex
                  ? 'font-semibold text-background'
                  : 'text-foreground',
              )}
            >
              {year}
            </Text>
          </Pressable>
        )}
      />

      <LinearGradient
        pointerEvents="none"
        colors={['rgba(0,0,0,0.07)', 'transparent']}
        className="absolute inset-x-0 top-0 h-12"
      />
      <LinearGradient
        pointerEvents="none"
        colors={['transparent', 'rgba(0,0,0,0.07)']}
        className="absolute inset-x-0 bottom-0 h-12"
      />
    </View>
  );
}

type DatePickerTriggerProps = {
  label?: string;
  error?: string;
  disabled?: boolean;
  style?: ViewStyle;
  variant: 'filled' | 'outline' | 'group';
  labelStyle?: TextStyle;
  icon: ReactNode;
  displayText: string;
  hasValue: boolean;
  onPress: () => void;
};

function DatePickerTrigger({
  label,
  error,
  disabled = false,
  style,
  variant,
  labelStyle,
  icon,
  displayText,
  hasValue,
  onPress,
}: DatePickerTriggerProps) {
  const triggerClassName = cn(
    'w-full flex-row items-center rounded-lg',
    variant === 'group' ? 'border-0 bg-transparent px-0' : 'min-h-12 px-4',
    variant === 'filled' && 'border-border bg-muted border',
    variant === 'outline' && 'border-border border',
  );

  return (
    <Pressable
      className={cn(triggerClassName, disabled && 'opacity-50')}
      style={style}
      onPress={onPress}
      disabled={disabled}
    >
      <View
        className="flex-1 flex-row items-center gap-2"
      >
        <View
          className="flex-row items-center gap-2"
          style={{ width: label ? 120 : 'auto' }}
        >
          {icon}

          {/* Label takes 1/3 of available width when present */}
          {label && (
            <Text
              variant="caption"
              numberOfLines={1}
              ellipsizeMode="tail"
              className={cn(
                'flex-1',
                error ? 'text-destructive' : 'text-muted-foreground',
              )}
              style={labelStyle}
            >
              {label}
            </Text>
          )}
        </View>

        {/* Text takes 2/3 of available width when label is present, or full width when no label */}
        <View className="flex-1">
          <Text
            numberOfLines={1}
            ellipsizeMode="tail"
            className={cn(
              hasValue ? 'text-foreground' : 'text-muted-foreground',
            )}
          >
            {displayText}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

type FooterProps = {
  mode: string;
  viewMode: 'date' | 'time';
  onToday: () => void;
  onCancel: () => void;
  onNext: () => void;
  onDone: () => void;
};

function Footer({
  mode,
  viewMode,
  onToday,
  onCancel,
  onNext,
  onDone,
}: FooterProps) {
  return (
    <View
      className="flex-row items-center justify-between gap-3 pt-5"
    >
      <View
        className="flex-row gap-2"
      >
        <Button
          title="Today"
          onPress={onToday}
          variant="shadcn"
          className="rounded-full"
          size="sm"

        />

        <Button
          title={mode === 'range' ? 'Clear' : 'Cancel'}
          onPress={onCancel}
          variant="shadcn"
          className="rounded-full"
          size="sm"

        />
      </View>

      {mode === 'datetime' && viewMode === 'date'
        ? (
            <Button
              title="Next"
              onPress={onNext}
              className="flex-1 rounded-full"
              variant="shadcn"
              size="sm"

            />
          )
        : (
            <Button
              title="Done"
              onPress={onDone}
              className="flex-1 rounded-full"
              variant="shadcn"
              size="sm"
            />
          )}
    </View>
  );
}

function getModeIcon(mode: string, textColor: string): ReactNode {
  if (mode === 'time')
    return <Clock size={20} color={textColor} strokeWidth={1} />;
  if (mode === 'datetime')
    return <CalendarClock size={20} color={textColor} strokeWidth={1} />;
  if (mode === 'range')
    return <CalendarRange size={20} color={textColor} strokeWidth={1} />;
  return <Calendar size={20} color={textColor} strokeWidth={1} />;
}

function useDatePickerModal(navigation: NavigationState) {
  const [isOpen, setIsOpen] = useState(false);

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      navigation.setShowMonthPicker(false);
      navigation.setShowYearPicker(false);
    }
  };

  const handleOpenPicker = () => {
    navigation.setCurrentDate(new Date());
    navigation.setViewMode('date');
    navigation.setShowMonthPicker(false);
    navigation.setShowYearPicker(false);
    setIsOpen(true);
  };

  return { isOpen, setIsOpen, handleOpenChange, handleOpenPicker };
}

type PickerContentProps = {
  mode: string;
  navigation: NavigationState;
  calendarData: CalendarData;
  selection: SelectionState;
  value?: Date | DateRange;
  minimumDate?: Date;
  maximumDate?: Date;
  timeFormat: '12' | '24';
  textColor: string;
};

function PickerContent({
  mode,
  navigation,
  calendarData,
  selection,
  value,
  minimumDate,
  maximumDate,
  timeFormat,
  textColor,
}: PickerContentProps) {
  if (navigation.showMonthPicker) {
    return (
      <MonthPickerView
        selectedIndex={calendarData.month}
        onSelect={navigation.handleMonthSelect}
      />
    );
  }

  if (navigation.showYearPicker) {
    return (
      <YearPickerView
        selectedIndex={calendarData.year}
        onSelect={navigation.handleYearSelect}
      />
    );
  }

  const isTimeMode
    = mode === 'time'
      || (mode === 'datetime' && navigation.viewMode === 'time');

  if (isTimeMode) {
    return (
      <TimePickerView
        currentDate={navigation.currentDate}
        timeFormat={timeFormat}
        onTimeChange={navigation.handleTimeChange}
      />
    );
  }

  return (
    <CalendarView
      calendarData={calendarData}
      mode={mode}
      value={value}
      tempRange={selection.tempRange}
      minimumDate={minimumDate}
      maximumDate={maximumDate}
      textColor={textColor}
      onNavigateMonth={navigation.navigateMonth}
      onOpenMonthPicker={() => navigation.setShowMonthPicker(true)}
      onOpenYearPicker={() => navigation.setShowYearPicker(true)}
      onSelectDay={selection.handleDateSelect}
    />
  );
}

export function DatePicker(props: DatePickerProps) {
  const {
    label,
    error,
    placeholder = 'Select date',
    disabled = false,
    style,
    minimumDate,
    maximumDate,
    timeFormat = '24',
    variant = 'filled',
    labelStyle,
    errorStyle,
  } = props;

  const mode = props.mode || 'date';
  const value = props.value;
  const onChange = props.onChange;

  const { text: textColor } = useThemeColors();

  const navigation = useNavigationState(value, mode);
  const modal = useDatePickerModal(navigation);
  const selection = useSelectionState({
    value,
    mode,
    onChange,
    minimumDate,
    maximumDate,
    navigation,
    setIsOpen: modal.setIsOpen,
  });

  const calendarData = buildCalendarData(navigation.currentDate);

  const displayText = formatDisplayValue({ value, mode, placeholder, timeFormat });
  const title = getBottomSheetTitle({
    mode,
    viewMode: navigation.viewMode,
    showMonthPicker: navigation.showMonthPicker,
    showYearPicker: navigation.showYearPicker,
  });

  return (
    <>
      <DatePickerTrigger
        label={label}
        error={error}
        disabled={disabled}
        style={style}
        variant={variant}
        labelStyle={labelStyle}
        icon={getModeIcon(mode, textColor)}
        displayText={displayText}
        hasValue={!!value}
        onPress={modal.handleOpenPicker}
      />

      {error && (
        <Text
          variant="caption"
          className="text-destructive mt-1"
          style={[{ marginLeft: 14 }, errorStyle]}
        >
          {error}
        </Text>
      )}

      <BottomSheet
        open={modal.isOpen}
        onOpenChange={modal.handleOpenChange}
        title={title}
        snapPoints={['70%']}
      >
        <View className="flex-1">
          <PickerContent
            mode={mode}
            navigation={navigation}
            calendarData={calendarData}
            selection={selection}
            value={value}
            minimumDate={minimumDate}
            maximumDate={maximumDate}
            timeFormat={timeFormat}
            textColor={textColor}
          />

          <Footer
            mode={mode}
            viewMode={navigation.viewMode}
            onToday={selection.resetToToday}
            onCancel={selection.handleCancel}
            onNext={() => navigation.setViewMode('time')}
            onDone={selection.handleConfirm}
          />
        </View>
      </BottomSheet>
    </>
  );
}
