/**
 * Jordan cities and their areas — single source of mock data for landing page City/Area dropdowns.
 */

export interface JordanCityWithAreas {
  id: string;
  name: string;
  areas: string[];
}

export const JORDAN_CITIES_WITH_AREAS: JordanCityWithAreas[] = [
  {
    id: "amman",
    name: "Amman",
    areas: [
      "Abdoun",
      "Swefieh",
      "Dabouq",
      "Jabal Amman",
      "Jabal Al Hussein",
      "Jabal Al Weibdeh",
      "Shmeisani",
      "Abdali",
      "Marka",
      "Tlaa Al Ali",
      "Wadi Al Seer",
      "Marj Al Hamam",
      "Naour",
      "Khirbet Al Sokhn",
      "Yadudeh",
      "Madaba Road",
      "Airport Road",
      "University Street",
      "Rainbow Street",
      "Third Circle",
      "Fourth Circle",
      "Fifth Circle",
      "Sixth Circle",
      "Seventh Circle",
      "Eighth Circle",
    ],
  },
  {
    id: "zarqa",
    name: "Zarqa",
    areas: [
      "New Zarqa",
      "Zarqa City Center",
      "Hitteen",
      "Al Hashemi",
      "Al Dhahabi",
      "Al Yarmouk",
      "Al Rusaifa Road",
      "Industrial Area",
    ],
  },
  {
    id: "irbid",
    name: "Irbid",
    areas: [
      "Irbid City Center",
      "University Street",
      "Al Hassan",
      "Al Ramtha Road",
      "Al Mazar",
      "Bait Ras",
      "Al Taybeh",
      "Northern Heights",
    ],
  },
  {
    id: "russeifa",
    name: "Russeifa",
    areas: [
      "Russeifa Center",
      "Al Yarmouk",
      "Al Qadeseh",
      "Industrial Zone",
      "Al Hashimi",
    ],
  },
  {
    id: "aqaba",
    name: "Aqaba",
    areas: [
      "Aqaba City Center",
      "Tala Bay",
      "South Beach",
      "Industrial Port",
      "Marina",
      "Ayla",
    ],
  },
  {
    id: "madaba",
    name: "Madaba",
    areas: [
      "Madaba City Center",
      "Ma'in",
      "Mukawir",
      "Mount Nebo",
      "Hesban",
    ],
  },
  {
    id: "mafraq",
    name: "Mafraq",
    areas: [
      "Mafraq City Center",
      "Al Zaatari Road",
      "Al Ruwayshed",
      "Northern Badia",
    ],
  },
  {
    id: "jerash",
    name: "Jerash",
    areas: [
      "Jerash City Center",
      "Souf",
      "Al Kitteh",
      "Al Mastaba",
    ],
  },
  {
    id: "ajloun",
    name: "Ajloun",
    areas: [
      "Ajloun City Center",
      "Anjara",
      "Kufranjah",
      "Ibbin",
    ],
  },
  {
    id: "salt",
    name: "Salt",
    areas: [
      "Salt City Center",
      "Al Ardha",
      "Iraq Al Amir",
      "Al Yadudeh",
    ],
  },
  {
    id: "karak",
    name: "Karak",
    areas: [
      "Karak City Center",
      "Al Qasr",
      "Mazar",
      "Al Fajj",
    ],
  },
  {
    id: "tafilah",
    name: "Tafilah",
    areas: [
      "Tafilah City Center",
      "Buseira",
      "Al Hasa",
    ],
  },
  {
    id: "maan",
    name: "Ma'an",
    areas: [
      "Ma'an City Center",
      "Petra",
      "Wadi Rum",
      "Al Jafr",
    ],
  },
  {
    id: "ramtha",
    name: "Ramtha",
    areas: [
      "Ramtha City Center",
      "Al Hassan Industrial",
      "Northern Border",
    ],
  },
  {
    id: "sahab",
    name: "Sahab",
    areas: [
      "Sahab Industrial",
      "Sahab Center",
      "Al Muwaqqar Road",
    ],
  },
  {
    id: "fuheis",
    name: "Fuheis",
    areas: [
      "Fuheis Center",
      "Al Nuzha",
    ],
  },
  {
    id: "shobak",
    name: "Shobak",
    areas: [
      "Shobak Castle",
      "Shobak Center",
    ],
  },
  {
    id: "deir-alla",
    name: "Deir Alla",
    areas: [
      "Deir Alla Center",
      "Jordan Valley",
    ],
  },
  {
    id: "kufranjah",
    name: "Kufranjah",
    areas: [
      "Kufranjah Center",
      "Ajloun Road",
    ],
  },
];

/** City names only (for backward compatibility if needed). */
export const JORDAN_CITIES = JORDAN_CITIES_WITH_AREAS.map((c) => c.name);

/** Get areas for a city by name. */
export function getAreasByCityName(cityName: string): string[] {
  const city = JORDAN_CITIES_WITH_AREAS.find(
    (c) => c.name.toLowerCase() === cityName.trim().toLowerCase()
  );
  return city ? city.areas : [];
}

/** Get city by name. */
export function getCityByName(cityName: string): JordanCityWithAreas | undefined {
  return JORDAN_CITIES_WITH_AREAS.find(
    (c) => c.name.toLowerCase() === cityName.trim().toLowerCase()
  );
}
