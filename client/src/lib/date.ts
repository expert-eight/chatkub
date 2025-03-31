export const convertDateToTH = (dateStr: string): string => {
    const date = new Date(dateStr);
    return date.toLocaleString("th-TH", { timeZone: "Asia/Bangkok" });
  };