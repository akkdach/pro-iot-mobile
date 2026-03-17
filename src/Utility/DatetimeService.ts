export const formatMinutesToHours = (minutes: any): string => {
  const num = parseInt(minutes);
  const hours = num > 60 ? Math.floor(num / 60) : 0;
  const mins = num % 60;
  return `${hours.toLocaleString()} ชั่วโมง ${mins} นาที`;
};



export const formatDate = (
  utcDate?: string | Date | null
): string => {
  if (!utcDate) return "ไม่มีข้อมูล";

  let date: Date;

  if (typeof utcDate === "string") {
    // ถ้า string ไม่มี timezone (Z หรือ +) → parse เป็น local time
    const s = utcDate.trim();
    if (!s.includes("Z") && !s.includes("+") && !s.match(/\d{2}-\d{2}:\d{2}$/)) {
      // แทนที่ T ด้วย space เพื่อบังคับ local time parsing
      const parts = s.match(/^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2}):?(\d{2})?/);
      if (parts) {
        const [, Y, Mo, D, H, Mi, S = "0"] = parts;
        date = new Date(Number(Y), Number(Mo) - 1, Number(D), Number(H), Number(Mi), Number(S));
      } else {
        date = new Date(s);
      }
    } else {
      date = new Date(s);
    }
  } else {
    date = new Date(utcDate);
  }

  if (isNaN(date.getTime())) return "ไม่มีข้อมูล";

  return date.toLocaleString("th-TH", {
    timeZone: "Asia/Bangkok",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
};


export const formatTime = (timeStr: string | Date | Number | null | undefined): string => {
  if (!timeStr) return "ไม่มีข้อมูล";

  const raw = String(timeStr).trim();

  if (/^\d{2}:\d{2}$/.test(raw)) {
    return raw;
  }

  return "ไม่มีข้อมูล";
};


export const splitDate = (date: Date) => {
  const year = date.getFullYear().toString();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return { year, month, day };
};


