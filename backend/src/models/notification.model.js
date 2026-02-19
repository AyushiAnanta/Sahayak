import mongoose from "mongoose";

const { Schema } = mongoose;

const notificationSchema = new Schema(
  {
    grievanceId:{
        type: Schema.Types.ObjectId,
        ref: "Grievance",
        require: true,
    },

    message:{
        type: String,
        require: true,
        lowercase: false,
        trim: true
    },

    notification_type:{
        type: String,
        require: true,
        enum:["Update", "Under Process", "Completed", "Initiated", "Dropped"]
    },
    userId:{
        type: Schema.Types.ObjectId,
        ref: "User",
        require: true
    },

    status:{
        type: String,
        require: true,
        trim: true,

    },
},
{
    timestamps: true,
}
);

export const Notification = mongoose.model("Notification", notificationSchema);
