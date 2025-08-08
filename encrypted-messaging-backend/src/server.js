require("dotenv").config();
const app = require("./app");

const PORT = process.env.PORT || 1367;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
