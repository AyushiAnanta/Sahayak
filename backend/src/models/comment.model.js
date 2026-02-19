import mongoose from "mongoose";

const { Schema } = mongoose;

const commentSchema = new Schema({
    content:{
        type: String,
        require: true,
        lowercase: true,
        trim: true
    },
    is_deleted:{
        type: Boolean,
        require: true,
    },
    grievance_id:{
        type: Schema.Types.ObjectId,
        ref: "Grievance",
        require: true,
        
    },
    userId:{
        type: Schema.Types.ObjectId,
        ref: "User",
        require: true
    }
})

export const Comment = mongoose.model("Comment", commentSchema)