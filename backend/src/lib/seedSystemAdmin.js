import bcrypt from "bcryptjs";
import User from "../models/user.models.js";
import { SYSTEM_ADMIN, COLLEGE_ADMINS } from "./systemAdmin.constants.js";

export const seedSystemAdmin = async () => {
  // Create system admin
  const hashedPassword = await bcrypt.hash(SYSTEM_ADMIN.password, 10);

  const adminUser = await User.findOneAndUpdate(
    { email: SYSTEM_ADMIN.email },
    {
      fullname: SYSTEM_ADMIN.fullname,
      collegeName: SYSTEM_ADMIN.collegeName,
      password: hashedPassword,
      role: "system_admin",
      approvalStatus: "approved",
    },
    {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true,
    },
  );

  // Create college admins
  const collegeAdmins = await Promise.all(
    COLLEGE_ADMINS.map(async (collegeAdmin) => {
      const hashedPass = await bcrypt.hash(collegeAdmin.password, 10);
      return User.findOneAndUpdate(
        { email: collegeAdmin.email },
        {
          fullname: collegeAdmin.fullname,
          collegeName: collegeAdmin.collegeName,
          password: hashedPass,
          role: "college_admin",
          approvalStatus: "approved",
        },
        {
          upsert: true,
          new: true,
          setDefaultsOnInsert: true,
        },
      );
    }),
  );

  return { adminUser, collegeAdmins };
};
