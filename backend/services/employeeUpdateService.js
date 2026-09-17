import Employee from "../models/Employee.js";
import User from "../models/User.js";

import {
    validateManager,
    validateShift,
    validateOrganization,
    validateTeamLead,
} from "./employeeValidationService.js";

import {
    getEmployeeById,
} from "./employeeQueryService.js";

const ALLOWED_ROLES = [
    "employee",
    "team_lead",
    "manager",
];

const EMPLOYEE_FIELDS = [
    "phone",
    "cnic",
    "dateOfBirth",
    "gender",
    "department",
    "shift",
    "designation",
    "team",
    "manager",
    "teamLead",
    "joiningDate",
    "employmentType",
    "workLocation",
];

export const updateEmployee = async (
    id,
    data
) => {
    const employee = await Employee.findById(id);

    if (!employee) {
        return null;
    }

    const department =
        data.department || employee.department;

    const designation =
        data.designation || employee.designation;

    const team = Object.hasOwn(data, "team")
        ? data.team
        : employee.team;

    await validateOrganization({
        department,
        designation,
        team,
    });

    if (Object.hasOwn(data, "shift")) {
        await validateShift(data.shift);
    }

    if (Object.hasOwn(data, "manager")) {
        await validateManager(data.manager);
    }

    if (Object.hasOwn(data, "teamLead")) {
        await validateTeamLead(data.teamLead);
    }

    const userUpdates = {};

    if (data.name) {
        userUpdates.name = data.name;
    }

    if (data.email) {
        const email = data.email.toLowerCase();

        const existingUser = await User.findOne({
            email,
            _id: { $ne: employee.user },
        });

        if (existingUser) {
            throw new Error("Email already exists");
        }

        userUpdates.email = email;
    }

    if (data.role) {
        if (!ALLOWED_ROLES.includes(data.role)) {
            throw new Error("Invalid employee role");
        }

        userUpdates.role = data.role;
    }

    if (Object.keys(userUpdates).length) {
        await User.findByIdAndUpdate(
            employee.user,
            userUpdates,
            { runValidators: true }
        );
    }

    EMPLOYEE_FIELDS.forEach((field) => {
        if (Object.hasOwn(data, field)) {
            employee[field] = data[field];
        }
    });

    await employee.save();

    return getEmployeeById(id);
};