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

/**
 * Formats a date string (ISO) to MM-DD-YYYY
 */
export const formatDate = (dateStr?: string): string => {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return ""; // handle invalid dates
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${mm}-${dd}-${yyyy}`;
};
