import { useAppContext } from "../contexts/AppContext";

import { CountryCount } from "../scripts/processArticles";
import { countries, TCountryCode } from "countries-list";

function getFlagEmoji(countryCode: string) {
  const codePoints = countryCode
    .toUpperCase()
    .split("")
    .map((char) => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
}

const getCountriesArray = (countryCount: CountryCount, sampleCount: number) => {
  return Object.entries(countryCount)
    .map(([code, count]) => ({
      code,
      name: countries[code as TCountryCode]?.name || code,
      emoji: getFlagEmoji(code),
      count,
      factor: sampleCount ? count / sampleCount : 0,
    }))
    .sort((a, b) => b.count - a.count)
    .filter((entry) => entry.factor > 0.05)
    .slice(0, 6);
};

export default function TopCountriesList() {
  const { stats } = useAppContext();

  const countries = getCountriesArray(
    stats?.countryDistribution || {},
    stats?.authorshipCountriesCount || 0
  );

  return (
    <div>
      <h2>Where are authors from?</h2>
      <div className="flex flex-wrap gap-x-1 gap-y-2">
        {countries.map((country) => (
          <div
            key={country.code}
            className="flex bg-[#F5F3EE] rounded-full items-center gap-1 px-2 py-0.5 text-sm"
          >
            <div>{country.emoji}</div>
            <div className="font-medium">{country.name}</div>
            <div className="text-neutral-500">
              ~{Math.floor(country.factor * 100)}%
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
