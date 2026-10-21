import mongoose from "mongoose";
import {
  bootstrapSuperAdmin,
} from "../services/bootstrapSuperAdminService.js";

const uri = process.env.BOOTSTRAP_MONGO_URI;
const name = process.env.BOOTSTRAP_ADMIN_NAME;
const email = process.env.BOOTSTRAP_ADMIN_EMAIL;
const password = process.env.BOOTSTRAP_ADMIN_PASSWORD;

if (!uri || !name || !email || !password) {
  console.error("Bootstrap configuration is incomplete");
  process.exitCode = 1;
} else {
  try {
    await mongoose.connect(uri);
    const server = await mongoose.connection.db.admin().command({ hello: 1 });
    if (server.msg === "isdbgrid") {
      throw new Error("Sharded bootstrap is unsupported");
    }
    await bootstrapSuperAdmin({ name, email, password });
    console.log("Super Admin created successfully");
  } catch {
    // Keep database errors and credentials out of command output.
    console.error("Super Admin bootstrap failed; verify the database is empty and configuration is valid");
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}
