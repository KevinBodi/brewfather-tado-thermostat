const cron = require("node-cron");
const Tado = require("node-tado-client");
const axios = require("axios");

require("dotenv").config();

var tado = new Tado();

cron.schedule("*/20 * * * *", function () {
  console.log("updating brewfather every twenty minutes");
  let temperature = undefined;

  tado.login(process.env.TADO_USERNAME, process.env.TADO_PASSWORD).then(() => {
    tado
      .getZoneState(process.env.TADO_HOME_ID, process.env.TADO_ZONE_ID)
      .then((resp) => {
        temperature =
          resp?.sensorDataPoints?.insideTemperature?.celsius ?? undefined;
        if (typeof temperature == "number") {
          axios
            .post(process.env.BREWFATHER_WEBHOOK, {
              name: process.env.BREWFATHER_DEVICE_NAME,
              ext_temp: temperature,
              temp_unit: "C",
            })
            .then(function (response) {
              console.log(response);
            })
            .catch(function (error) {
              console.log(error);
            });
        }
      })
      .catch(function (err) {
        console.log(err);
      });
  });
});
