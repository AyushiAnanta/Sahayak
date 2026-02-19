import mongoose, {Schema} from "mongoose";

const grievanceSchema = new Schema({

    userId: {
        type: Schema.Types.ObjectId, 
        ref: "User",
        required:true
    },

    inputType: {
        type: String,
        required: true,
        lowercase: true
    },
    
    originalText: {
        type: String,
        required: true,
        lowercase: true
    },
    
    originalLanguage: {
        type: String,
        required: true,
        lowercase: true
    },

    translatedText: {
        type: String,
        required: true,
        lowercase: true
    }, 

    input_url: {
        type: String,
        lowercase: true
    },

    category: {
        type: String,
        lowercase: true
    },

    subCategory: {
        type: String,
        lowercase: true
    },

    summaryText: {
        type: String,
        lowercase: true
    },

    summaryUserLang: {
        type: String,
        lowercase: true
    },

    keywords: [
        {
            type: String,
            lowercase: true
        }
    ],

    priorityScore: {
        type: number
    },

    status: {
      type: String,
      enum: ["pending", "in_progress", "resolved", "rejected"],
      default: "pending"
    },

    departmentId: {
        type: Schema.Types.ObjectId,
        ref: "Department"
    },

    assignedOfficerId : {
        type: Schema.Types.ObjectId,
        ref: "User"
    }, 

    district: {
        type: String,
        required: true
    }, 

    pincode: {
        type: String,
        required: true
    }, 

    is_deleted: {
        type: Boolean,
        default: false,
        required: true
    },

    
},{
    timestamps: true
})

export const Grievance = mongoose.model("Grievance")