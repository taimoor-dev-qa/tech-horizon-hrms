import mongoose from "mongoose";

const designationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Designation name is required"],
      trim: true,
    },

    code: {
      type: String,
      required: [true, "Designation code is required"],
      trim: true,
      uppercase: true,
      unique: true,
    },

    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      required: [true, "Department is required"],
    },

    description: {
      type: String,
      trim: true,
      default: "",
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

designationSchema.index(
  {
    name: 1,
    department: 1,
  },
  {
    unique: true,
  }
);

const Designation = mongoose.model(
  "Designation",
  designationSchema
);

export default Designation;