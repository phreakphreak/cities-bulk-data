import * as fs from "node:fs";

export default async function fillCitiesCodeNull() {
  const { default: cities } = await import("../cities.json", {
    assert: { type: "json" },
  });
  const { default: citiesPending } = await import(
    "../strCityNullPending.json",
    {
      assert: { type: "json" },
    }
  );
  const lower = (value = "") => value.toLowerCase().trim();

  const result = cities
  .filter(e=> citiesPending.find(item=> lower(item.citName)===lower(e.name))).map(e=> {
    return `update strCity set couId='${e.country}'  where couId is null and citName = '${e.name.replace(
        /'/g,
        "''"
      )}';`;
  }).join("\n")
    

  fs.writeFile("citiesPending.txt", result, (err) => {
    if (err) {
      throw err;
    }
    console.log("Cities data is saved.");
  });
}

fillCitiesCodeNull();
