import {
  buildBookingDates,
  buildBookingMonthView,
  createBookingSlotMap,
  findEarliestOpenBookingDate,
} from '../bookingCalendar';

describe('bookingCalendar helper', () => {
  test('builds a rolling 30-day booking window with calendar metadata for each date', () => {
    const dates = buildBookingDates(new Date('2026-04-19T12:00:00.000Z'));

    expect(dates).toHaveLength(30);
    expect(dates[0].isOpen).toBe(true);
    expect(dates[1].isOpen).toBe(true);
    expect(dates[2].isOpen).toBe(false);
    expect(dates[6].isOpen).toBe(true);
    expect(dates[8].isOpen).toBe(false);
    expect(dates[0]).toMatchObject({
      key: '2026-04-19',
      weekday: 'Sun',
      day: '19',
      month: 'Apr',
      monthKey: '2026-04',
      year: 2026,
      monthIndex: 3,
      fullLabel: 'Apr 19, 2026',
      isWindowDate: true,
      isOpen: expect.any(Boolean),
      isSelectable: expect.any(Boolean),
    });
    expect(dates[29].key).toBe('2026-05-18');
    expect(dates[29]).toMatchObject({
      monthKey: '2026-05',
      year: 2026,
      monthIndex: 4,
      fullLabel: 'May 18, 2026',
      isWindowDate: true,
    });
  });

  test('returns the earliest open booking date key or null', () => {
    const dates = [
      { key: '2026-04-22', isOpen: true },
      { key: '2026-04-19', isOpen: false },
      { key: '2026-04-21', isOpen: true },
      { key: '2026-04-20', isOpen: false },
    ];

    expect(findEarliestOpenBookingDate(dates)).toBe('2026-04-21');
    expect(findEarliestOpenBookingDate([{ key: '2026-04-19', isOpen: false }])).toBeNull();
    expect(findEarliestOpenBookingDate(null)).toBeNull();
  });

  test('builds a month view with navigation metadata and selectable day cells', () => {
    const dates = buildBookingDates(new Date('2026-04-19T12:00:00.000Z'));
    const monthView = buildBookingMonthView(dates, '2026-04');

    expect(monthView.label).toBe('April 2026');
    expect(monthView.monthLabel).toBe('April 2026');
    expect(monthView.weekdayLabels).toEqual(['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']);
    expect(monthView.canGoPrev).toBe(false);
    expect(monthView.canGoNext).toBe(true);
    expect(monthView.prevMonthKey).toBe('2026-03');
    expect(monthView.nextMonthKey).toBe('2026-05');
    expect(monthView.weeks[0]).toHaveLength(7);
    expect(monthView.weeks.flat().some((cell) => cell.key === '2026-04-19')).toBe(true);

    expect(monthView.weeks.flat().find((cell) => cell.key === '2026-04-19')).toMatchObject({
      label: '19',
      fullLabel: 'Apr 19, 2026',
      isSelectable: true,
      isCurrentMonth: true,
      isWindowDate: true,
    });
    expect(monthView.weeks.flat().find((cell) => cell.key === '2026-04-18')).toMatchObject({
      label: '18',
      fullLabel: 'Apr 18, 2026',
      isSelectable: false,
      isCurrentMonth: true,
      isWindowDate: false,
    });
    expect(monthView.weeks.flat().find((cell) => cell.key === '2026-03-29')).toMatchObject({
      isSelectable: false,
      isCurrentMonth: false,
      isWindowDate: false,
    });
  });

  test('fails safely on invalid month view inputs', () => {
    expect(buildBookingMonthView(null, '2026-04')).toEqual({
      monthKey: null,
      label: '',
      monthLabel: '',
      weekdayLabels: [],
      canGoPrev: false,
      canGoNext: false,
      prevMonthKey: null,
      nextMonthKey: null,
      weeks: [],
    });

    expect(buildBookingMonthView([], '2026-00')).toEqual({
      monthKey: null,
      label: '',
      monthLabel: '',
      weekdayLabels: [],
      canGoPrev: false,
      canGoNext: false,
      prevMonthKey: null,
      nextMonthKey: null,
      weeks: [],
    });

    expect(buildBookingMonthView([], '2026-13')).toEqual({
      monthKey: null,
      label: '',
      monthLabel: '',
      weekdayLabels: [],
      canGoPrev: false,
      canGoNext: false,
      prevMonthKey: null,
      nextMonthKey: null,
      weeks: [],
    });
  });

  test('creates deterministic slot maps with compatible unavailable reasons', () => {
    const dates = buildBookingDates(new Date('2026-04-19T12:00:00.000Z'));
    const firstMap = createBookingSlotMap(dates);
    const secondMap = createBookingSlotMap(dates);

    expect(firstMap).toEqual(secondMap);
    expect(Object.keys(firstMap)).toEqual(dates.map((date) => date.key));

    const closedDate = dates.find((date) => !date.isOpen);
    expect(closedDate).toBeDefined();
    expect(firstMap[closedDate.key].every((slot) => slot.available === false && slot.reason === 'Closed')).toBe(true);

    const firstOpenDate = dates[0];
    const secondOpenDate = dates[1];

    expect(firstMap[firstOpenDate.key][0]).toMatchObject({
      key: '8:00 AM',
      label: '8:00 AM',
      available: false,
      reason: 'Booked',
    });
    expect(firstMap[firstOpenDate.key][1]).toMatchObject({
      key: '9:00 AM',
      label: '9:00 AM',
      available: true,
    });
    expect(firstMap[firstOpenDate.key][4]).toMatchObject({
      key: '1:00 PM',
      label: '1:00 PM',
      available: false,
      reason: 'Booked',
    });

    expect(firstMap[secondOpenDate.key][3]).toMatchObject({
      key: '11:00 AM',
      label: '11:00 AM',
      available: false,
      reason: 'Maxed',
    });
    expect(firstMap[secondOpenDate.key][7]).toMatchObject({
      key: '4:00 PM',
      label: '4:00 PM',
      available: false,
      reason: 'Maxed',
    });
  });

  test('uses local calendar dates instead of UTC slicing for booking keys', () => {
    const toISOStringSpy = jest.spyOn(Date.prototype, 'toISOString').mockImplementation(function mockToISOString() {
      const year = this.getFullYear();
      const month = String(this.getMonth() + 1).padStart(2, '0');
      const day = String(this.getDate() + 1).padStart(2, '0');
      return `${year}-${month}-${day}T00:00:00.000Z`;
    });

    try {
      const dates = buildBookingDates(new Date('2026-04-19T08:00:00.000Z'), 2);

      expect(dates[0]).toMatchObject({
        key: '2026-04-19',
        day: '19',
        weekday: 'Sun',
        fullLabel: 'Apr 19, 2026',
      });
      expect(dates[1]).toMatchObject({
        key: '2026-04-20',
        day: '20',
        fullLabel: 'Apr 20, 2026',
      });
    } finally {
      toISOStringSpy.mockRestore();
    }
  });

  test('uses local labels when building month view cells', () => {
    const getUTCDateSpy = jest.spyOn(Date.prototype, 'getUTCDate').mockImplementation(function mockGetUTCDate() {
      return this.getDate() + 1;
    });
    const getUTCMonthSpy = jest.spyOn(Date.prototype, 'getUTCMonth').mockImplementation(function mockGetUTCMonth() {
      return this.getMonth();
    });
    const getUTCFullYearSpy = jest
      .spyOn(Date.prototype, 'getUTCFullYear')
      .mockImplementation(function mockGetUTCFullYear() {
        return this.getFullYear();
      });
    const getUTCDaySpy = jest.spyOn(Date.prototype, 'getUTCDay').mockImplementation(function mockGetUTCDay() {
      return this.getDay() + 1;
    });
    const toISOStringSpy = jest.spyOn(Date.prototype, 'toISOString').mockImplementation(function mockToISOString() {
      const year = this.getFullYear();
      const month = String(this.getMonth() + 1).padStart(2, '0');
      const day = String(this.getDate() + 1).padStart(2, '0');
      return `${year}-${month}-${day}T00:00:00.000Z`;
    });

    try {
      const monthView = buildBookingMonthView(
        [
          {
            key: '2026-04-19',
            isOpen: true,
            isSelectable: true,
            monthKey: '2026-04',
            windowIndex: 0,
          },
        ],
        '2026-04',
      );

      expect(monthView.label).toBe('April 2026');
      expect(monthView.weeks.flat().find((cell) => cell.key === '2026-04-19')).toMatchObject({
        fullLabel: 'Apr 19, 2026',
        isCurrentMonth: true,
      });
    } finally {
      getUTCDateSpy.mockRestore();
      getUTCMonthSpy.mockRestore();
      getUTCFullYearSpy.mockRestore();
      getUTCDaySpy.mockRestore();
      toISOStringSpy.mockRestore();
    }
  });
});
