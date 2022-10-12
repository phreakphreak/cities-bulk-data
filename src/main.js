import * as XLSX from "xlsx";
import * as fs from "node:fs";

export default function convertDataToExcel(data, fileName) {
  return new Promise(async (res, rej) => {
    try {
      const pathFileName = `./sheets/${fileName}-${+new Date()}.xls`;
      const sheetName = fileName;
      const worksheet = XLSX.utils.json_to_sheet(data);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
      XLSX.writeFile(workbook, pathFileName);
      res(true);
    } catch (err) {
      rej(err);
    }
  });
}

async function main() {
  const { default: cities } = await import("../cities.json", {
    assert: { type: "json" },
  });
  const { default: continents } = await import("../continents.json", {
    assert: { type: "json" },
  });

  const { default: citiesProd } = await import("../strCityProduction.json", {
    assert: { type: "json" },
  });
  const continentsSelected = ["Europe", "South America", "North America"];
  const countriesSelected = Object.entries(continents).flatMap(([key, value]) => {
    if (continentsSelected.includes(key)) {
      return value.map((e) => e.abbreviation);
    }
    return [];
  });

  console.log(Array.isArray(continents));
  const lower = (value = "") => value.toLowerCase().trim();
  const promCities = cities
    .filter((e) => countriesSelected.includes(e.country))
    .map(async (city) => {
      let cityFound = citiesProd.find(
        (item) => lower(item.citName) === lower(city.name)
      );

      if (cityFound && !!cityFound.couId) return null;

      if (cityFound) {
        const query = `update strCity set couId=${
          city.country
        }  where couId is null and citName = '${cityFound.citName.replace(
          /'/g,
          "''"
        )}';`;
        return { type: "update", query };
      }

      const query = `insert into strCity (citName, couId) values ('${city.name.replace(
        /'/g,
        "''"
      )}','${city.country}');`;
      return { type: "insert", query };
    });
  console.log(promCities.length);
  const proms = await Promise.allSettled(promCities);
  const data = proms
    .filter((e) => e.value)
    .reduce((state, curr) => {
      state[curr.value?.type] ??= [];
      state[curr.value?.type].push(curr.value.query);
      return state;
    }, {});
  const { insert, update } = data;

  fs.writeFile("insertCitiesByContinent.txt", insert.join("\n"), (err) => {
    if (err) {
      throw err;
    }
    console.log("Cities data is saved.");
  });

  fs.writeFile("updateCitiesByContinent.txt", update.join("\n"), (err) => {
    if (err) {
      throw err;
    }
    console.log("Cities Update data is saved.");
  });
}

main();
