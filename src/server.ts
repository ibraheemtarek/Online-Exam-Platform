import app from "./app.js";
import { PORT } from "./config/env.variables.js";

const port = PORT || 3000;

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
