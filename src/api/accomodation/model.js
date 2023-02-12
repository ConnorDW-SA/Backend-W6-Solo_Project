import mongoose from "mongoose";

const Schema = mongoose.Schema;

const accomodationSchema = new Schema(
  {
    name: { type: String, required: true },
    city: { type: String, required: true },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    description: { type: String, required: true },
    rooms: { type: Number, required: true }
  },
  { timestamps: true }
);

export default mongoose.model("Accomodation", accomodationSchema);
