import * as fs from "node:fs"

export default async function getContinent() {
  const { default: countries } = await import("../countryContinent.json", {
    assert: { type: "json" },
  });
  const { default: countriesCode } = await import("../countryCodes.json", {
    assert: { type: "json" },
  });
  const lower = (value = "") => value.toLowerCase().trim();

  const result = countries.reduce((state, curr) => {
    state[curr.continent] ??= [];
    const country = countriesCode.find(
      (e) => lower(e.country) === lower(curr.country)
    );
    if(country) state[curr.continent].push({ ...curr, ...country });

    return state;
  }, {});

  fs.writeFile("continents.json", JSON.stringify(result), (err) => {
    if (err) {
      throw err;
    }
    console.log("Cities data is saved.");
  });
}

getContinent()