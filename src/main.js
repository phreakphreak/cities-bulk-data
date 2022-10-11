import * as XLSX from "xlsx";
import * as fs from "node:fs"

export default function convertDataToExcel(data, fileName) {
  return new Promise(async(res, rej) => {
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
  console.log(cities.length);
  const { default: strCities } = await import("../strCity.json", {
    assert: { type: "json" },
  });
  console.log(strCities.length);
  const filterCities = cities
      .filter((e) => !strCities.find((item) => item.couId === e.country))
      .map(async(city) => {

        return `insert into strCity (citName, couId) values ('${city.name.replace(/'/g, "''")}','${city.country}');`
      });

    const proms = await Promise.allSettled(filterCities);
    const data =proms.map(e=>e.value).join("\n")


  fs.writeFile('result.txt', data, err => {
    if (err) {
      throw err
    }
    console.log('JSON data is saved.')
  })

}

main();
