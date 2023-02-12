import mongoose from "mongoose";
import bcrypt from "bcrypt";

const Schema = mongoose.Schema;

const UserSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true
    },
    password: { type: String, required: true },
    email: { type: String, required: true },
    role: { type: String, enum: ["Host", "Guest", "Admin"], default: "Guest" },
    avatar: { type: String, default: "https://i.imgur.com/8Q9QY7C.png" }
  },
  { timestamps: true }
);

UserSchema.pre("save", async function (next) {
  const newUser = this;
  if (newUser.isModified("password")) {
    const plainPW = newUser.password;
    const hash = await bcrypt.hash(plainPW, 10);
    newUser.password = hash;
  }
  next();
});

UserSchema.methods.toJSON = function () {
  const userDocument = this;
  const userObject = userDocument.toObject();
  delete userObject.password;
  delete userObject.__v;
  return userObject;
};

UserSchema.statics.checkCredentials = async function (email, plainPW) {
  const user = await this.findOne({ email });
  if (user) {
    const isMatch = await bcrypt.compare(plainPW, user.password);
    if (isMatch) return user;
  } else {
    return null;
  }
};

export default mongoose.model("User", UserSchema);
