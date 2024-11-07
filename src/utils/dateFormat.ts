/**
 * 将localdatetime类型时间转换成yyyy-MM-dd hh:mm:ss格式
 * @param dateTimeString
 * @returns
 */
export function formatLocalDateTime(dateTimeString: string) {
  // 将字符串转换为 Date 对象
  const date = new Date(dateTimeString);
  // 获取年份、月份、日期、小时、分钟和秒
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0"); // 月份从 0 开始
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");

  // 返回格式化字符串
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}
/**
 * 获取今天的日期 格式:yyyy年MM月dd日
 * @param date
 * @returns
 */
export function formatDateToString(date: Date) {
  const year = date.getFullYear(); // 获取年份
  const month = String(date.getMonth() + 1).padStart(2, "0"); // 获取月份（注意要加1）并补零
  const day = String(date.getDate()).padStart(2, "0"); // 获取日期并补零

  return `${year}年${month}月${day}日`; // 返回格式化字符串
}

// 将date-select选择的日期转换成'yyyy-MM-dd HH:mm:ss'
export function formatDateForBackend(date) {
  if (!date) return null;
  return date.toISOString().slice(0, 19); // 将 ISO 格式转换为 'yyyy-MM-dd HH:mm:ss'
}
