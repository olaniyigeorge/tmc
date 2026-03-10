import mongoose from "mongoose";

let cached: { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null } = {
  conn: null,
  promise: null,
};

export async function connectToDatabase() {
  if (cached.conn) {
    return cached.conn;
  }
  if (!cached.promise) {
    const uri = process.env.MONGODB_URI;
    const dbName = process.env.MONGO_DB_NAME;
    if (!uri) {
      throw new Error("Please define the MONGODB_URI environment variable inside .env.local");
    }
    console.log("\nConnecting to MongoDB...\n");
    cached.promise = mongoose
      .connect(uri, { dbName })
      .then((mongoose) => {
        return mongoose;
      });
  }
  cached.conn = await cached.promise;
  return cached.conn;
}
