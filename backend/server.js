require("dotenv").config();

const app = require("./src/app");

const config =
  require("./src/config/app.config");

const {connectMySQL} = require("./src/database/mysql");

const connectMongo = require("./src/database/mongo");

const startServer = async () => {
  try {

    await connectMySQL();

    await connectMongo();

    app.listen(config.port, () => {
      console.log(
        `Server running on port ${config.port}`
      );
    });

  } catch (error) {

    console.error(
      " Startup Failed"
    );

    process.exit(1);
  }
};

startServer();