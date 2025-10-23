import toast from "react-hot-toast";
import { Role } from "../types"; // relative path from utils to types

export const mapRoleNameToId = (
  roles: Role[],
  roleName: string
): string | undefined => {
  const role = roles.find((r) => r.name === roleName);
  if (!role) {
    toast.error(`Role not created: "${roleName}"`);
    return undefined;
  }
  return role.id;
};

export const formatNumberForText = (val: any, decimals = 2): string | null => {
  if (val === null || val === undefined) return null;
  if (typeof val === "number") return val.toFixed(decimals);
  if (!isNaN(Number(val))) return Number(val).toFixed(decimals);
  return String(val);
};
