// Comprehensive ISO Alpha-2 code mapping for global countries
export const COUNTRY_ISO_MAP: Record<string, string> = {
  // North America
  USA: "us", "United States": "us", America: "us", Canada: "ca", Mexico: "mx",
  Guatemala: "gt", Cuba: "cu", Haiti: "ht", "Dominican Republic": "do",
  Honduras: "hn", "El Salvador": "sv", Nicaragua: "ni", "Costa Rica": "cr",
  Panama: "pa", Jamaica: "jm", "Trinidad and Tobago": "tt", Bahamas: "bs",

  // South America
  Argentina: "ar", Brazil: "br", Chile: "cl", Colombia: "co", Peru: "pe",
  Venezuela: "ve", Ecuador: "ec", Bolivia: "bo", Paraguay: "py", Uruguay: "uy",
  Guyana: "gy", Suriname: "sr",

  // Europe
  Ukraine: "ua", Germany: "de", UK: "gb", "United Kingdom": "gb", Britain: "gb",
  France: "fr", Italy: "it", Spain: "es", Poland: "pl", Romania: "ro",
  Netherlands: "nl", Belgium: "be", Greece: "gr", Portugal: "pt", "Czech Republic": "cz",
  Czechia: "cz", Sweden: "se", Hungary: "hu", Austria: "at", Switzerland: "ch",
  Bulgaria: "bg", Denmark: "dk", Finland: "fi", Slovakia: "sk", Norway: "no",
  Ireland: "ie", Croatia: "hr", Serbia: "rs", Lithuania: "lt", Slovenia: "si",
  Latvia: "lv", Estonia: "ee", Cyprus: "cy", Luxembourg: "lu", Iceland: "is",
  Malta: "mt", Albania: "al", Moldova: "md", "Bosnia and Herzegovina": "ba",
  Georgia: "ge", Armenia: "am", Azerbaijan: "az", Russia: "ru", Belarus: "by",
  EU: "eu", "European Union": "eu",

  // Asia
  China: "cn", India: "in", Japan: "jp", "South Korea": "kr", Korea: "kr",
  Indonesia: "id", Pakistan: "pk", Bangladesh: "bd", Philippines: "ph",
  Vietnam: "vn", Turkey: "tr", Türkiye: "tr", Iran: "ir", Thailand: "th",
  Myanmar: "mm", Burma: "mm", Iraq: "iq", Afghanistan: "af", "Saudi Arabia": "sa",
  Uzbekistan: "uz", Malaysia: "my", Yemen: "ye", Nepal: "np", Syria: "sy",
  "Sri Lanka": "lk", Kazakhstan: "kz", Jordan: "jo", UAE: "ae", "United Arab Emirates": "ae",
  Israel: "il", Palestine: "ps", Lebanon: "lb", Singapore: "sg", Oman: "om",
  Kuwait: "kw", Qatar: "qa", Bahrain: "bh", Taiwan: "tw", Mongolia: "mn",
  Cambodia: "kh", Laos: "la",

  // Africa
  Nigeria: "ng", Ethiopia: "et", Egypt: "eg", DRC: "cd", "DR Congo": "cd",
  "Democratic Republic of the Congo": "cd", Tanzania: "tz", "South Africa": "za",
  Kenya: "ke", Uganda: "ug", Sudan: "sd", Algeria: "dz", Morocco: "ma",
  Angola: "ao", Ghana: "gh", Mozambique: "mz", Madagascar: "mg",
  "Ivory Coast": "ci", "Cote d'Ivoire": "ci", Cameroon: "cm", Niger: "ne",
  Mali: "ml", Burkina: "bf", "Burkina Faso": "bf", Malawi: "mw", Zambia: "zm",
  Chad: "td", Somalia: "so", Senegal: "sn", Zimbabwe: "zw", Guinea: "gn",
  Rwanda: "rw", Benin: "bj", Burundi: "bi", Tunisia: "tn", "South Sudan": "ss",
  Togo: "tg", "Sierra Leone": "sl", Libya: "ly", Congo: "cg", Liberia: "lr",
  Mauritania: "mr", Eritrea: "er", Namibia: "na", Gambia: "gm", Botswana: "bw",
  Gabon: "ga", Lesotho: "ls", Guinea_Bissau: "gw", Equatorial_Guinea: "gq",
  Mauritius: "mu", Eswatini: "sz", Djibouti: "dj",

  // Oceania
  Australia: "au", "New Zealand": "nz", "Papua New Guinea": "pg", Fiji: "fj",
  Solomon_Islands: "sb", Vanuatu: "vu", Samoa: "ws", Tonga: "to",
  Micronesia: "fm", Kiribati: "ki", Palau: "pw", "Marshall Islands": "mh",
  "Kermadec Islands region": "nz",
};

// Exact official geographic center coordinates [lat, lng]
export const COUNTRY_COORDINATES: Record<string, [number, number]> = {
  USA: [39.8283, -98.5795],
  "United States": [39.8283, -98.5795],
  China: [35.8617, 104.1954],
  India: [20.5937, 78.9629],
  Brazil: [-14.235, -51.9253],
  Russia: [55.7558, 37.6173],
  Germany: [51.1657, 10.4515],
  UK: [55.3781, -3.436],
  "United Kingdom": [55.3781, -3.436],
  France: [46.2276, 2.2137],
  Japan: [36.2048, 138.2529],
  Canada: [56.1304, -106.3468],
  Australia: [-25.2744, 133.7751],
  Mexico: [23.6345, -102.5528],
  Indonesia: [-0.7893, 113.9213],
  Pakistan: [30.3753, 69.3451],
  Nigeria: [9.082, 8.6753],
  Ukraine: [48.3794, 31.1656],
  Argentina: [-38.4161, -63.6167],
  Turkey: [38.9637, 35.2433],
  "South Africa": [-30.5595, 22.9375],
  Egypt: [26.8206, 30.8025],
  "Saudi Arabia": [23.8859, 45.0792],
  "South Korea": [35.9078, 127.7669],
  Vietnam: [14.0583, 108.2772],
  Taiwan: [23.6978, 120.9605],
  Netherlands: [52.1326, 5.2913],
  Singapore: [1.3521, 103.8198],
  Bangladesh: [23.685, 90.3563],
  Somalia: [5.1521, 46.1996],
  Philippines: [12.8797, 121.774],
  Ethiopia: [9.145, 40.4897],
  Chile: [-35.6751, -71.543],
  Spain: [40.4637, -3.7492],
  Iran: [32.4279, 53.688],
  Israel: [31.0461, 34.8516],
  Italy: [41.8719, 12.5674],
  Poland: [51.9194, 19.1451],
  Colombia: [4.5709, -74.2973],
  Peru: [-9.19, -75.0152],
  Thailand: [15.87, 100.9925],
  Kenya: [-0.0236, 37.9062],
  Sweden: [60.1282, 18.6435],
  Norway: [60.472, 8.4689],
  Finland: [61.9241, 25.7482],
  Greece: [39.0742, 21.8243],
  Portugal: [39.3999, -8.2245],
  Switzerland: [46.8182, 8.2275],
  Austria: [47.5162, 14.5501],
  Belgium: [50.5039, 4.4699],
  Ireland: [53.1424, -7.6921],
  "New Zealand": [-40.9006, 174.886],
  Malaysia: [4.2105, 101.9758],
  Morocco: [31.7917, -7.0926],
  Algeria: [28.0339, 1.6596],
  Iraq: [33.2232, 43.6793],
  Afghanistan: [33.9391, 67.71],
  Sudan: [12.8628, 30.2176],
  Uganda: [1.3733, 32.2903],
  Ghana: [7.9465, -1.0232],
  Venezuela: [6.4238, -66.5897],
  Cuba: [21.5218, -77.7812],
  Yemen: [15.5527, 48.5164],
  Syria: [34.8021, 38.9968],
  Lebanon: [33.8547, 35.8623],
  Jordan: [30.5852, 36.2384],
  Myanmar: [21.9162, 95.956],
  "Sri Lanka": [7.8731, 80.7718],
  Nepal: [28.3949, 84.124],
};

export function getCountryCode(country: string): string | null {
  if (!country || country.trim().toLowerCase() === "global") return null;
  const trimmed = country.trim();
  if (COUNTRY_ISO_MAP[trimmed]) return COUNTRY_ISO_MAP[trimmed];

  // Case insensitive check
  const lower = trimmed.toLowerCase();
  for (const [key, code] of Object.entries(COUNTRY_ISO_MAP)) {
    if (key.toLowerCase() === lower) return code;
  }
  return null;
}

export function getCountryCoordinates(country: string): [number, number] | null {
  if (!country || country.trim().toLowerCase() === "global") return null;
  const trimmed = country.trim();
  if (COUNTRY_COORDINATES[trimmed]) return COUNTRY_COORDINATES[trimmed];

  const lower = trimmed.toLowerCase();
  for (const [key, coords] of Object.entries(COUNTRY_COORDINATES)) {
    if (key.toLowerCase() === lower) return coords;
  }
  return null;
}
