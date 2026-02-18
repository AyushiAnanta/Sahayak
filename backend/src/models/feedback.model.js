import mongoose, {Schema} from "mongoose";

const feedbackSchema = new Schema({

    userId: {
        type: Schema.Types.ObjectId, 
        ref: "User",
        required:true
    },

    grievanceId: {
        type: Schema.Types.ObjectId,
        ref: "Grievance"
    },

    rating: {
        type: Number,
        enum: [1,2,3,4,5]
    },

    resolved: {
        type: Boolean,
        required: true,
        default: false
    },

    comments: [
        {
            type: String
        }
    ]
},{timestamps: true})