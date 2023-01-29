export interface Period<T> {
  start: T
  end: T
}

export interface PeriodsAPIConfig<T> {
  compare: (a: T, b: T) => number
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function makePeriodsAPI<T>({ compare }: PeriodsAPIConfig<T>) {
  function comparePeriods(a: Period<T>, b: Period<T>): number {
    return compare(a.start, b.start) || compare(a.end, b.end)
  }
  function unitePeriods(a: Period<T>, b: Period<T>): Period<T> {
    return {
      start: compare(a.start, b.start) < 0 ? a.start : b.start,
      end: compare(a.end, b.end) < 0 ? b.end : a.end,
    }
  }
  function intersectPeriods(a: Period<T>, b: Period<T>): Period<T> {
    return {
      start: compare(a.start, b.start) < 0 ? b.start : a.start,
      end: compare(a.end, b.end) < 0 ? a.end : b.end,
    }
  }
  function isValidPeriod(periodsIntersection: Period<T>): boolean {
    return compare(periodsIntersection.start, periodsIntersection.end) < 0
  }
  function sortAndUnitePeriods(periods: Array<Period<T>>): Array<Period<T>> {
    if (periods.length < 2) {
      return periods
    }
    const sorted = periods.slice().sort(comparePeriods)
    const result = [sorted[0]]
    let lastPeriodIndex = 0
    let i = 1
    while (i < sorted.length) {
      const period = sorted[i++]
      const lastPeriod = result[lastPeriodIndex]
      if (isValidPeriod(intersectPeriods(lastPeriod, period))) {
        result[lastPeriodIndex] = unitePeriods(lastPeriod, period)
        continue
      }
      result.push(period)
      lastPeriodIndex++
    }
    return result
  }
  function makePeriodContainsCheck(period: Period<T>): (value: T) => boolean {
    return (value) =>
      compare(period.start, value) < 1 && compare(value, period.end) < 1
  }
  function subtractPeriods(a: Period<T>, b: Period<T>): Array<Period<T>> {
    const intersection = intersectPeriods(a, b)
    if (!isValidPeriod(intersection)) {
      return [a]
    }
    const isStartBeforeIntersection = compare(a.start, intersection.start) < 0
    const isEndAfterIntersection = compare(a.end, intersection.end) > 0
    return isStartBeforeIntersection
      ? isEndAfterIntersection
        ? [
            { start: a.start, end: intersection.start },
            { start: intersection.end, end: a.end },
          ]
        : [{ start: a.start, end: intersection.start }]
      : isEndAfterIntersection
      ? [{ start: intersection.end, end: a.end }]
      : []
  }
  function subtractPeriodsFromPeriods(
    periods: Array<Period<T>>,
    periodsToSubtract: Array<Period<T>>
  ): Array<Period<T>> {
    return periodsToSubtract.reduce(
      (periods, breakPeriod) =>
        periods.flatMap((period) => subtractPeriods(period, breakPeriod)),
      periods
    )
  }
  return {
    comparePeriods,
    unitePeriods,
    intersectPeriods,
    isValidPeriod,
    sortAndUnitePeriods,
    makePeriodContainsCheck,
    subtractPeriods,
    subtractPeriodsFromPeriods
  }
}
