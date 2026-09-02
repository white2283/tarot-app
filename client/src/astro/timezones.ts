/** 出生城市时区库:世界城市 → IANA 时区。中国大陆统一 Asia/Shanghai(默认,无夏令时)。
 *  港澳台与海外城市单独映射,用于把"出生城市当地钟表时间"正确换算成 UTC,
 *  否则本命盘 ASC/MC 会因时区偏差而算错(此前按浏览器本地时区解析)。 */
const TZ: Record<string, string> = {
  // 港澳台
  "香港": "Asia/Hong_Kong", "澳门": "Asia/Macau",
  "台北": "Asia/Taipei", "新北": "Asia/Taipei", "桃园": "Asia/Taipei", "台中": "Asia/Taipei",
  "台南": "Asia/Taipei", "高雄": "Asia/Taipei", "基隆": "Asia/Taipei", "新竹": "Asia/Taipei",
  "嘉义": "Asia/Taipei", "花莲": "Asia/Taipei", "台东": "Asia/Taipei", "宜兰": "Asia/Taipei",
  "彰化": "Asia/Taipei", "南投": "Asia/Taipei", "屏东": "Asia/Taipei",
  // 日本
  "东京": "Asia/Tokyo", "横滨": "Asia/Tokyo", "大阪": "Asia/Tokyo", "京都": "Asia/Tokyo",
  "名古屋": "Asia/Tokyo", "札幌": "Asia/Tokyo", "福冈": "Asia/Tokyo", "那霸": "Asia/Tokyo",
  // 韩国 / 朝鲜
  "首尔": "Asia/Seoul", "釜山": "Asia/Seoul", "仁川": "Asia/Seoul", "大邱": "Asia/Seoul",
  "平壤": "Asia/Pyongyang",
  // 东南亚
  "曼谷": "Asia/Bangkok", "清迈": "Asia/Bangkok",
  "新加坡": "Asia/Singapore", "吉隆坡": "Asia/Kuala_Lumpur",
  "雅加达": "Asia/Jakarta", "登巴萨": "Asia/Makassar",
  "马尼拉": "Asia/Manila", "河内": "Asia/Ho_Chi_Minh", "胡志明市": "Asia/Ho_Chi_Minh",
  "金边": "Asia/Phnom_Penh", "万象": "Asia/Vientiane",
  "仰光": "Asia/Yangon", "内比都": "Asia/Yangon", "斯里巴加湾": "Asia/Brunei",
  // 南亚
  "新德里": "Asia/Kolkata", "孟买": "Asia/Kolkata", "加尔各答": "Asia/Kolkata",
  "班加罗尔": "Asia/Kolkata", "金奈": "Asia/Kolkata", "海得拉巴": "Asia/Kolkata",
  "卡拉奇": "Asia/Karachi", "拉合尔": "Asia/Karachi", "达卡": "Asia/Dhaka",
  "加德满都": "Asia/Kathmandu", "科伦坡": "Asia/Colombo", "马累": "Indian/Maldives", "廷布": "Asia/Thimphu",
  // 中东
  "迪拜": "Asia/Dubai", "阿布扎比": "Asia/Dubai", "利雅得": "Asia/Riyadh", "吉达": "Asia/Riyadh",
  "科威特城": "Asia/Kuwait", "多哈": "Asia/Qatar", "马斯喀特": "Asia/Muscat", "德黑兰": "Asia/Tehran",
  "伊斯坦布尔": "Europe/Istanbul", "安卡拉": "Europe/Istanbul",
  "特拉维夫": "Asia/Jerusalem", "耶路撒冷": "Asia/Jerusalem", "安曼": "Asia/Amman",
  "贝鲁特": "Asia/Beirut", "巴格达": "Asia/Baghdad",
  // 中亚 / 高加索
  "阿斯塔纳": "Asia/Almaty", "阿拉木图": "Asia/Almaty", "塔什干": "Asia/Tashkent",
  "比什凯克": "Asia/Bishkek", "杜尚别": "Asia/Dushanbe", "阿什哈巴德": "Asia/Ashgabat",
  "巴库": "Asia/Baku", "第比利斯": "Asia/Tbilisi", "埃里温": "Asia/Yerevan",
  // 非洲
  "开罗": "Africa/Cairo", "亚历山大": "Africa/Cairo",
  "约翰内斯堡": "Africa/Johannesburg", "开普敦": "Africa/Johannesburg",
  "内罗毕": "Africa/Nairobi", "拉各斯": "Africa/Lagos", "阿克拉": "Africa/Accra",
  "卡萨布兰卡": "Africa/Casablanca", "突尼斯": "Africa/Tunis", "阿尔及尔": "Africa/Algiers",
  "的黎波里": "Africa/Tripoli", "喀土穆": "Africa/Khartoum", "亚的斯亚贝巴": "Africa/Addis_Ababa",
  "达累斯萨拉姆": "Africa/Dar_es_Salaam", "卢萨卡": "Africa/Lusaka", "哈拉雷": "Africa/Harare",
  "坎帕拉": "Africa/Kampala", "基加利": "Africa/Kigali", "达喀尔": "Africa/Dakar", "阿比让": "Africa/Abidjan",
  // 欧洲
  "莫斯科": "Europe/Moscow", "圣彼得堡": "Europe/Moscow", "基辅": "Europe/Kyiv", "明斯克": "Europe/Minsk",
  "华沙": "Europe/Warsaw", "柏林": "Europe/Berlin", "慕尼黑": "Europe/Berlin", "汉堡": "Europe/Berlin",
  "法兰克福": "Europe/Berlin", "巴黎": "Europe/Paris", "里昂": "Europe/Paris", "马赛": "Europe/Paris",
  "伦敦": "Europe/London", "曼彻斯特": "Europe/London", "伯明翰": "Europe/London", "爱丁堡": "Europe/London",
  "都柏林": "Europe/Dublin", "阿姆斯特丹": "Europe/Amsterdam", "布鲁塞尔": "Europe/Brussels",
  "苏黎世": "Europe/Zurich", "日内瓦": "Europe/Zurich", "维也纳": "Europe/Vienna", "布拉格": "Europe/Prague",
  "布达佩斯": "Europe/Budapest", "布加勒斯特": "Europe/Bucharest", "贝尔格莱德": "Europe/Belgrade",
  "萨拉热窝": "Europe/Sarajevo", "索菲亚": "Europe/Sofia", "雅典": "Europe/Athens",
  "罗马": "Europe/Rome", "米兰": "Europe/Rome", "威尼斯": "Europe/Rome", "佛罗伦萨": "Europe/Rome", "那不勒斯": "Europe/Rome",
  "马德里": "Europe/Madrid", "巴塞罗那": "Europe/Madrid", "里斯本": "Europe/Lisbon",
  "斯德哥尔摩": "Europe/Stockholm", "奥斯陆": "Europe/Oslo", "哥本哈根": "Europe/Copenhagen",
  "赫尔辛基": "Europe/Helsinki", "雷克雅未克": "Atlantic/Reykjavik",
  // 美洲
  "纽约": "America/New_York", "波士顿": "America/New_York", "华盛顿": "America/New_York",
  "费城": "America/New_York", "迈阿密": "America/New_York", "亚特兰大": "America/New_York",
  "芝加哥": "America/Chicago", "休斯顿": "America/Chicago", "达拉斯": "America/Chicago",
  "洛杉矶": "America/Los_Angeles", "旧金山": "America/Los_Angeles", "西雅图": "America/Los_Angeles",
  "拉斯维加斯": "America/Los_Angeles", "凤凰城": "America/Los_Angeles", "丹佛": "America/Denver",
  "火奴鲁鲁": "Pacific/Honolulu", "安克雷奇": "America/Anchorage",
  "多伦多": "America/Toronto", "渥太华": "America/Toronto", "蒙特利尔": "America/Toronto",
  "温哥华": "America/Vancouver", "卡尔加里": "America/Edmonton",
  "墨西哥城": "America/Mexico_City", "哈瓦那": "America/Havana", "危地马拉城": "America/Guatemala",
  "巴拿马城": "America/Panama", "波哥大": "America/Bogota", "加拉加斯": "America/Caracas",
  "基多": "America/Guayaquil", "利马": "America/Lima", "拉巴斯": "America/La_Paz",
  "圣地亚哥": "America/Santiago", "布宜诺斯艾利斯": "America/Argentina/Buenos_Aires", "蒙得维的亚": "America/Montevideo",
  "圣保罗": "America/Sao_Paulo", "里约热内卢": "America/Sao_Paulo", "巴西利亚": "America/Sao_Paulo",
  "萨尔瓦多": "America/Sao_Paulo", "帕拉马里博": "America/Paramaribo", "乔治敦": "America/Guyana",
  // 大洋洲
  "悉尼": "Australia/Sydney", "墨尔本": "Australia/Sydney", "堪培拉": "Australia/Sydney",
  "布里斯班": "Australia/Brisbane", "珀斯": "Australia/Perth", "阿德莱德": "Australia/Adelaide",
  "奥克兰": "Pacific/Auckland", "惠灵顿": "Pacific/Auckland", "基督城": "Pacific/Auckland",
  "苏瓦": "Pacific/Fiji", "莫尔兹比港": "Pacific/Port_Moresby", "阿加尼亚": "Pacific/Guam"
};

export function cityTimeZone(name: string): string {
  return TZ[name] ?? "Asia/Shanghai";
}

/** 把"出生城市当地钟表时间"(dateStr+timeStr)换算成 UTC 时刻,自动处理夏令时(Intl 迭代求偏移) */
export function birthUtc(dateStr: string, timeStr: string, tz: string): Date {
  const [y, mo, d] = dateStr.split("-").map(Number);
  const [h, mi] = (timeStr || "12:00").split(":").map(Number);
  const wall = Date.UTC(y, mo - 1, d, h || 0, mi || 0);
  const offset = (utcMs: number): number => {
    try {
      const fmt = new Intl.DateTimeFormat("en-US", {
        timeZone: tz, hour12: false,
        year: "numeric", month: "2-digit", day: "2-digit",
        hour: "2-digit", minute: "2-digit", second: "2-digit"
      });
      const parts: Record<string, number> = {};
      for (const p of fmt.formatToParts(new Date(utcMs))) {
        if (p.type !== "literal") parts[p.type] = parseInt(p.value, 10);
      }
      const hh = parts.hour === 24 ? 0 : parts.hour;
      return Date.UTC(parts.year, parts.month - 1, parts.day, hh, parts.minute, parts.second) - utcMs;
    } catch {
      return 0;
    }
  };
  let utc = wall;
  for (let i = 0; i < 2; i++) utc = wall - offset(utc);
  return new Date(utc);
}
