import mongoose from "mongoose";

export default async function () {
  await mongoose
    .connect(process.env.DB_URL)
    .then(async () => {
      console.log(`Database connected ams_software`);
      
    })
    .catch((err) => console.log(`Database connection error ${err.message}`));
}
