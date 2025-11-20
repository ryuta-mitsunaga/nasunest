import { connectDB } from "~~/server/database"

export default defineNitroPlugin(async () => {
  if (process.server) {
    await connectDB()
  }
})
