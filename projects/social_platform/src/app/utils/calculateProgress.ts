/** @format */

import { User } from "@auth/models/user.model";
import { fieldsProfile } from "projects/core/src/consts/fieldsProfile";

export const calculateProfileProgress = (user: User) => {
  let filledCount = 0;

  fieldsProfile.forEach(({ key, type }) => {
    const value = user[key as keyof User];

    if (type === "array") {
      if (Array.isArray(value) && value.length > 0) filledCount++;
    } else {
      if (typeof value === "string" && value.trim() !== "") filledCount++;
    }
  });

  return Math.round((filledCount / fieldsProfile.length) * 100);
};
