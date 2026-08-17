import { connect } from "mongoose";
import { DB_URL } from "./env.variables.js";

async function testDBConnection() {
  try {
    await connect(DB_URL);
    console.log("DB connected");
  } catch (error) {
    console.log(error);
    console.log("DB connection failed");
  }
}

export default testDBConnection;
