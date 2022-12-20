const epxress = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const mongoose = require("mongoose");

const userRoutes = require("./routes/userRoutes");
const globalErrorHandler = require("./controllers/errorController");
const reminder = require("./utils/cron");

dotenv.config({ path: "./.env" });

const DB = process.env.DATABASE.replace(
  "<password>",
  process.env.DATABASE_PASSWORD
);

mongoose.connect(DB, {}).then(con => {
  console.log("DB connection succesful");
});

const app = epxress();

app.use(
  epxress.json({
    limit: "10kb",
  })
);
app.use(
  cors({
    credentials: true,
    origin: "http://localhost:3000",
  })
);

app.use("/user", userRoutes);

app.use(globalErrorHandler);
reminder.schedule();

const port = process.env.PORT;
const server = app.listen(port, () => {
  console.log(`App is live on port:${port}`);
});
