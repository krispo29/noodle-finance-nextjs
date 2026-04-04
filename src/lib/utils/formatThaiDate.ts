/**
 * Format date to Thai Buddhist Era style
 * @param date - Date object or ISO string
 * @returns Formatted date string (e.g., "จ. 4 เม.ย. 2568")
 */
export function formatThaiDate(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;

  // Thai Buddhist Era year (CE + 543)
  const thaiYear = dateObj.getFullYear() + 543;

  // Thai day abbreviation
  const thaiDays = ['อา.', 'จ.', 'อ.', 'พ.', 'พฤ.', 'ศ.', 'ส.'];
  const dayAbbr = thaiDays[dateObj.getDay()];

  // Thai month abbreviation
  const thaiMonths = [
    'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
    'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'
  ];
  const monthAbbr = thaiMonths[dateObj.getMonth()];

  const day = dateObj.getDate();

  return `${dayAbbr} ${day} ${monthAbbr} ${thaiYear}`;
}

/**
 * Format date to Thai Buddhist Era with full month name
 * @param date - Date object or ISO string
 * @returns Formatted date string (e.g., "จันทร์ที่ 4 เมษายน 2568")
 */
export function formatThaiDateFull(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;

  const thaiYear = dateObj.getFullYear() + 543;

  const thaiDays = ['อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์'];
  const dayName = thaiDays[dateObj.getDay()];

  const thaiMonths = [
    'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
    'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
  ];
  const monthName = thaiMonths[dateObj.getMonth()];

  const day = dateObj.getDate();

  return `${dayName}ที่ ${day} ${monthName} ${thaiYear}`;
}
