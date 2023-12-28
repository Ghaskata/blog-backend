import mongoose, { Schema } from "mongoose";

const subscriptionSchema = new Schema(
  {
    subscriber: {
      type: Schema.Types.ObjectId,  //one who is subscribing ex : a,b,c,d
      ref: "User",
    },

    channel: {
      type: Schema.Types.ObjectId,  //one to whom 'subscriber' is subscribing ex : free code camp etc 
      ref: "User",
    },
  },
  { timestamps: true }
);

export const Subscription = mongoose.model("Subscription", subscriptionSchema);
