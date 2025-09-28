const app = require("./app");
const mongoConnection = require("./config/db");

mongoConnection().then(() => {
  app.listen(3000, () => {
    console.log("Server is running on port 3000");
  });
});
