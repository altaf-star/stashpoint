import mongoose from "mongoose";
import dns from "dns";

// Some Windows setups fail to resolve the mongodb+srv:// SRV record via
// Node's DNS resolver even though the OS resolver works fine (a known
// Node-on-Windows quirk with certain router/ISP DNS servers). Pointing
// Node at a public DNS server sidesteps it.
dns.setServers(["8.8.8.8", "1.1.1.1"]);

export async function connectDB() {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    throw new Error("MONGO_URI is not set in the environment");
  }

  mongoose.set("strictQuery", true);

  await mongoose.connect(uri);
  console.log(`MongoDB connected: ${mongoose.connection.host}`);
}
