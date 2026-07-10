import mongoose from "mongoose";
import dns from "dns";

// Some Windows setups fail to resolve the mongodb+srv:// SRV record via
// Node's DNS resolver even though the OS resolver works fine (a known
// Node-on-Windows quirk with certain router/ISP DNS servers). Pointing
// Node at a public DNS server sidesteps it. Scoped to win32 only — not
// needed (and not worth the risk) on Vercel's Linux runtime.
if (process.platform === "win32") {
  dns.setServers(["8.8.8.8", "1.1.1.1"]);
}

// Serverless functions can get a fresh cold start per request, so the
// connection (and the in-flight connect promise, to dedupe concurrent
// cold-start requests) is cached on `global` and reused across invocations
// instead of opening a new one every time.
const cached = (global.__mongoose ??= { conn: null, promise: null });

export async function connectDB() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    const uri = process.env.MONGO_URI;
    if (!uri) {
      throw new Error("MONGO_URI is not set in the environment");
    }
    mongoose.set("strictQuery", true);
    cached.promise = mongoose.connect(uri).then((m) => {
      console.log(`MongoDB connected: ${m.connection.host}`);
      return m;
    });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}
