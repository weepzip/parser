const axios = require("axios");
const cheerio = require("cheerio");
const saveToCSV = require("./utils");

getCugmsForecast();
getCugmsWeatрer();
getMeteoinfoForecast();
getMeteoinfoWheather();

/* function for fetching CUGMS weather forecast */
async function getCugmsForecast() {
  console.log("Fetching CUGMS weather forecast...");

  const response = await axios.get(
    "http://cugms.ru/pogoda-i-klimat/prognoz-pogody/"
  );

  if (response.status !== 200) {
    console.error(
      "Error: " +
        response.status +
        " " +
        response.statusText +
        ". Restarting query..."
    );

    setTimeout(() => getCugmsForecast(), 10 * 60 * 1000);

    return;
  }

  const $ = cheerio.load(response.data);

  const table = [];

  $("tr").each((index, element) => {
    const row = [];
    $(element)
      .children()
      .each((index, element) => {
        row.push($(element).first().text());
      });
    table.push(row);
  });

  saveToCSV(`./cugms_forecast/${new Date().toISOString()}.csv`, table);

  console.log("CUGMS weather forecast has been fetched!");
  setTimeout(() => getCugmsForecast(), 10 * 60 * 1000);
}

/* function for fetching current CUGMS weather  */
async function getCugmsWeatрer() {
  console.log("Fetching CUGMS current weather...");

  const response = await axios.get(
    "http://cugms.ru/wp-content/uploads/2022/01/Yandex/meteocsdn.csv"
  );

  if (response.status !== 200) {
    console.error(
      "Error: " +
        response.status +
        " " +
        response.statusText +
        ". Restarting query..."
    );

    setTimeout(() => getCugmsWeatрer(), 5 * 60 * 1000);

    return;
  }

  const table = [];

  const rows = response.data.split("\n");

  rows.forEach((string, index) => {
    if (index === 0 || string.includes("АМК Москва Балчуг")) {
      const row = string.split(";");
      table.push(row);
    }
  });

  saveToCSV("./cugms_weather.csv", table, true);

  console.log("CUGMS current weather has been fetched!");

  setTimeout(() => getCugmsWeatрer(), 5 * 60 * 1000);
}

/* function for fetching MeteoInfo weather forecast */
async function getMeteoinfoForecast() {
  console.log("Fetching MeteoInfo weather forecast...");
  const response = await axios.get(
    "https://meteoinfo.ru/forecasts5000/russia/moscow-area"
  );

  if (response.status !== 200) {
    console.error(
      "Error: " +
        response.status +
        " " +
        response.statusText +
        ". Restarting query..."
    );

    setTimeout(() => getMeteoinfoForecast(), 10 * 60 * 1000);

    return;
  }

  const $ = cheerio.load(response.data);

  const table = [];

  $("div#div_print_0 table.fc_tab_1")
    .find("tr")
    .each((trIndex, tr) => {
      const row = [];

      $(tr)
        .children()
        .each((tdIndex, td) => {
          row.push($(td).text());
        });

      table.push(row);
    });

  const reversed = [];

  for (let i = 0; i < table[0].length; i++) {
    reversed.push([]);
  }

  for (let rowI = 0; rowI < table.length; rowI++) {
    for (let colI = 0; colI < table[0].length; colI++) {
      reversed[colI][rowI] = table[rowI][colI];

      if (colI === 0 && rowI === 0) {
        reversed[colI][rowI] = "Дата";
      }

      if (colI === 0 && [2, 7].includes(rowI)) {
        reversed[colI][rowI] = "Температура";
      }

      if (colI === 0 && [3, 8].includes(rowI)) {
        reversed[colI][rowI] = "Осадки";
      }
    }
  }

  const normalized = [];

  for (let i = 0; i < reversed.length; i++) {
    if (i === 0) {
      normalized.push([
        reversed[i][0],
        "Время суток",
        ...reversed[i].slice(2, 6),
      ]);
    } else {
      normalized.push([reversed[i][0], "Ночь", ...reversed[i].slice(7)]);
      normalized.push([reversed[i][0], "День", ...reversed[i].slice(2, 6)]);
    }
  }

  saveToCSV(`./meteoinfo_forecast/${new Date().toISOString()}.csv`, normalized);

  console.log("MeteoInfo weather forecast has been fetched!");

  setTimeout(() => getMeteoinfoForecast(), 10 * 60 * 1000);
}

/* function for fetching current MeteoInfo weather */
async function getMeteoinfoWheather() {
  console.log("Fetching MeteoInfo current weather...");

  const response = await axios.get(
    "https://meteoinfo.ru/pogoda/russia/moscow-area/moscow"
  );

  if (response.status !== 200) {
    console.error(
      "Error: " +
        response.status +
        " " +
        response.statusText +
        ". Restarting query..."
    );

    setTimeout(() => getMeteoinfoWheather(), 5 * 60 * 1000);

    return;
  }

  const $ = cheerio.load(response.data);

  const table = [[], []];

  $("div#div_4 table")
    .first()
    .find("tr")
    .each((trIndex, tr) => {
      $(tr)
        .children()
        .each((tdIndex, td) => {
          if (trIndex === 0) {
            table[0].push("");
            table[1].push($(td).text());
          } else {
            table[tdIndex].push($(td).text());
          }
        });
    });

  saveToCSV("./meteoinfo_wheater.csv", table, true);

  console.log("MeteoInfo weather has been fetched!");

  setTimeout(() => getMeteoinfoWheather(), 5 * 60 * 1000);
}
