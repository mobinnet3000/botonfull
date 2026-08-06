import dayjs, { type Dayjs } from 'dayjs';

const div = (a: number, b: number) => ~~(a / b);
const mod = (a: number, b: number) => a - ~~(a / b) * b;

function jalCal(jy: number) {
  const breaks = [-61, 9, 38, 199, 426, 686, 756, 818, 1111, 1181, 1210, 1635, 2060, 2097, 2192, 2262, 2324, 2394, 2456, 3178];
  const bl = breaks.length;
  const gy = jy + 621;
  let leapJ = -14;
  let jp = breaks[0];
  let jm = 0;
  let jump = 0;
  for (let i = 1; i < bl; i += 1) {
    jm = breaks[i];
    jump = jm - jp;
    if (jy < jm) break;
    leapJ = leapJ + div(jump, 33) * 8 + div(mod(jump, 33), 4);
    jp = jm;
  }
  let n = jy - jp;
  leapJ = leapJ + div(n, 33) * 8 + div(mod(n, 33) + 3, 4);
  if (mod(jump, 33) === 4 && jump - n === 4) leapJ += 1;
  const leapG = div(gy, 4) - div((div(gy, 100) + 1) * 3, 4) - 150;
  const march = 20 + leapJ - leapG;
  if (jump - n < 6) n = n - jump + div(jump + 4, 33) * 33;
  let leap = mod(mod(n + 1, 33) - 1, 4);
  if (leap === -1) leap = 4;
  return { leap, gy, march };
}

function g2d(gy: number, gm: number, gd: number) {
  let d = div((gy + div(gm - 8, 6) + 100100) * 1461, 4) + div(153 * mod(gm + 9, 12) + 2, 5) + gd - 34840408;
  d = d - div(div(gy + 100100 + div(gm - 8, 6), 100) * 3, 4) + 752;
  return d;
}

function d2g(jdn: number) {
  let j = 4 * jdn + 139361631;
  j = j + div(div(4 * jdn + 183187720, 146097) * 3, 4) * 4 - 3908;
  const i = div(mod(j, 1461), 4) * 5 + 308;
  const gd = div(mod(i, 153), 5) + 1;
  const gm = mod(div(i, 153), 12) + 1;
  const gy = div(j, 1461) - 100100 + div(8 - gm, 6);
  return [gy, gm, gd] as [number, number, number];
}

function j2d(jy: number, jm: number, jd: number): number {
  const r = jalCal(jy);
  return g2d(r.gy, 3, r.march) + (jm - 1) * 31 - div(jm, 7) * (jm - 7) + jd - 1;
}

function d2j(jdn: number): [number, number, number] {
  const gy = d2g(jdn)[0];
  let jy = gy - 621;
  const r = jalCal(jy);
  const jdn1f = g2d(gy, 3, r.march);
  let k = jdn - jdn1f;
  if (k >= 0) {
    if (k <= 185) {
      const jm = 1 + div(k, 31);
      const jd = mod(k, 31) + 1;
      return [jy, jm, jd];
    }
    k -= 186;
  } else {
    jy -= 1;
    k += 179;
    if (r.leap === 1) k += 1;
  }
  const jm = 7 + div(k, 30);
  const jd = mod(k, 30) + 1;
  return [jy, jm, jd];
}

export function toJalali(gy: number, gm: number, gd: number): [number, number, number] {
  return d2j(g2d(gy, gm, gd));
}

export function toGregorian(jy: number, jm: number, jd: number): [number, number, number] {
  return d2g(j2d(jy, jm, jd));
}

export interface JalaliDate {
  jy: number;
  jm: number;
  jd: number;
  year: number;
  month: number;
  day: number;
}

const JALALI_MONTHS = [
  'فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور',
  'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند',
];

export const JALALI_WEEKDAYS = ['شنبه', 'یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنجشنبه', 'جمعه'];

const toFa = (n: number | string) =>
  String(n).replace(/\d/g, (d) => '۰۱۲۳۴۵۶۷۸۹'[Number(d)]);

export function toJalaliDate(value: string | Date | Dayjs | null | undefined): JalaliDate | null {
  if (!value) return null;
  const d = dayjs(value);
  if (!d.isValid()) return null;
  const [jy, jm, jd] = toJalali(d.year(), d.month() + 1, d.date());
  return { jy, jm, jd, year: jy, month: jm, day: jd };
}

export function formatJalali(value?: string | Date | Dayjs | null, withTime = false): string {
  const j = toJalaliDate(value);
  if (!j) return '—';
  const date = `${toFa(j.jy)}/${toFa(j.jm)}/${toFa(j.jd)}`;
  if (!withTime || !value) return date;
  const d = dayjs(value);
  return `${date} ${toFa(d.hour())}:${toFa(String(d.minute()).padStart(2, '0'))}`;
}

export function jalaliMonthLabel(cursor: Dayjs): string {
  const j = toJalaliDate(cursor);
  if (!j) return '';
  return `${JALALI_MONTHS[j.jm - 1]} ${toFa(j.jy)}`;
}

export function jalaliDayLabel(value: string | Date | Dayjs, withWeekday = false): string {
  const j = toJalaliDate(value);
  if (!j) return '—';
  const base = `${toFa(j.jd)} ${JALALI_MONTHS[j.jm - 1]} ${toFa(j.jy)}`;
  if (!withWeekday) return base;
  return `${JALALI_WEEKDAYS[(dayjs(value).day() + 1) % 7]} ${base}`;
}
