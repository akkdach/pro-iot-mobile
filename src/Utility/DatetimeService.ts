export const formatMinutesToHours = (minutes: any): string => {
  const num = parseInt(minutes);
  const hours = num > 60 ? Math.floor(num / 60) :0;
  const mins = num % 60;
  return `${hours.toLocaleString()} ชั่วโมง ${mins} นาที`;
};