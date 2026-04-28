const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII']

export function toRoman(n: number): string {
  return ROMAN[n - 1] ?? String(n)
}

const DAYS_DA = ['SØNDAG', 'MANDAG', 'TIRSDAG', 'ONSDAG', 'TORSDAG', 'FREDAG', 'LØRDAG']
const MONTHS_DA = ['JAN', 'FEB', 'MAR', 'APR', 'MAJ', 'JUN', 'JUL', 'AUG', 'SEP', 'OKT', 'NOV', 'DEC']

const ROMAN_THOUSANDS = ['', 'M', 'MM', 'MMM']
const ROMAN_HUNDREDS = ['', 'C', 'CC', 'CCC', 'CD', 'D', 'DC', 'DCC', 'DCCC', 'CM']
const ROMAN_TENS = ['', 'X', 'XX', 'XXX', 'XL', 'L', 'LX', 'LXX', 'LXXX', 'XC']
const ROMAN_ONES = ['', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX']

export function yearToRoman(year: number): string {
  return (
    ROMAN_THOUSANDS[Math.floor(year / 1000)] +
    ROMAN_HUNDREDS[Math.floor((year % 1000) / 100)] +
    ROMAN_TENS[Math.floor((year % 100) / 10)] +
    ROMAN_ONES[year % 10]
  )
}

export function formatDateHeader(d: Date = new Date()): { day: string; date: string } {
  const day = DAYS_DA[d.getDay()]
  const dd = String(d.getDate()).padStart(2, '0')
  const month = MONTHS_DA[d.getMonth()]
  const year = yearToRoman(d.getFullYear())
  return { day, date: `${dd} · ${month} · ${year}` }
}
