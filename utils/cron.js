const cron = require("node-cron");
const User = require("../models/userModel");
const SendMail = require("./email");

const now = Date.now();

const schedule = () => {
  cron.schedule("* * * * *", async () => {
    try {
      const container = [];
      const user = await User.find().select("email tasks -_id");
      user.forEach(el => {
        container.push({
          email: el.email,
          date: el.tasks.map(t => t.dateDB),
          text: el.tasks.map(e => e.text),
        });
      });
      container.map(el => {
        const emailAdress = el.email;
        const text = el.text;
        el.date.forEach(async el => {
          if (Date.parse(el) - 600000 <= now) {
            const subjectText = `Task Reminder`;
            const emailBody = `Your task ${text} is due in around 10 minutes`;
            await SendMail({
              email: emailAdress,
              subject: subjectText,
              text: emailBody,
            });
            await User.findOneAndUpdate(
              { email: emailAdress },
              {
                $pull: { tasks: { dateDB: el } },
                safe: true,
                multi: true,
              }
            );
            console.log("Mail Sent");
          }
        });
      });
      console.log("running a task every minute");
    } catch (err) {
      console.log(err);
    }
  });
};

module.exports = { schedule };
