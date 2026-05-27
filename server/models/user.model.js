import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, "Username is required for creating an Account"],
      trim: true,
      unique: true,
    },
    email: {
      type: String,
      required: [true, "Email is required for creating the user"],
      unique: [true, "Email already exist"],
      match: [
        /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
        "Invalid email address",
      ],
    },
    password: {
      type: String,
      required: [true, "Password is required for creating an Account"],
      select: false,
    },
    systemUser:{
      type:Boolean,
      default:false,
      immutable:true,
      select:false
    }
  },
  {
    timestamps: true,
  },
);

export const User = mongoose.model("User", UserSchema);
