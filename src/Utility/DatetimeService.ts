export const formatMinutesToHours = (minutes: any): string => {
  const num = parseInt(minutes);
  const hours = num > 60 ? Math.floor(num / 60) :0;
  const mins = num % 60;
  return `${hours.toLocaleString()} ชั่วโมง ${mins} นาที`;
};


// export const formatDate = (utcDate: string | Date | null) => {

//   if (!utcDate) return null;

//   const date = new Date(utcDate);

//   if(isNaN(date.getTime())) return null;

//   const thaiTime = new Date(date.getTime() + 7 * 60 * 60 * 1000);

//   return thaiTime.toLocaleString("th-TH", {
//     timeZone: "Asia/Bangkok",
//     year: "numeric",
//     month: "2-digit",
//     day: "2-digit",
//     hour: "2-digit",
//     minute: "2-digit",
//     second: "2-digit",
//   });
// };

export const formatDate = (
  utcDate?: string | Date | null  
): string => {                    
  if (!utcDate) return "ไม่มีข้อมูล";

  const date = new Date(utcDate);

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



// export const formatTime = (timeStr: string | number | null | undefined) : String => {
//   if (!timeStr) return "ไม่มีข้อมูล";

//   const str = String(timeStr).padStart(6, "0"); 

//   if (!/^\d{6}$/.test(str)) return "ไม่มีข้อมูล";

//   const hh = str.substring(0, 2);
//   const mm = str.substring(2, 4);
//   const ss = str.substring(4, 6);

//   return `${hh}:${mm}:${ss}`;
// };

// export const formatTime = (timeStr: string | number | Date | null | undefined): string => {
//   if (!timeStr) return "ไม่มีข้อมูล";

//   if (timeStr instanceof Date) {
//     const hh = timeStr.getHours().toString().padStart(2, "0");
//     const mm = timeStr.getMinutes().toString().padStart(2, "0");
//     const ss = timeStr.getSeconds().toString().padStart(2, "0");
//     return `${hh}:${mm}:${ss}`;
//   }

//   const str = String(timeStr).padStart(6, "0");

//   if (!/^\d{6}$/.test(str)) return "ไม่มีข้อมูล";

//   const hh = str.substring(0, 2);
//   const mm = str.substring(2, 4);
//   const ss = str.substring(4, 6);

//   return `${hh}:${mm}:${ss}`;
// };


export const formatTime = (timeStr: string | Date | Number |null | undefined): string => {
  if (!timeStr) return "ไม่มีข้อมูล";

  const raw = String(timeStr).trim();

  if (/^\d{2}:\d{2}$/.test(raw)) {
    return raw; 
  }

  return "ไม่มีข้อมูล";
};
