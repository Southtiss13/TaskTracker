import { randomBytes } from "crypto";

export function createVerificationToken() {
  return randomBytes(32).toString("hex");
}

export function getVerificationTokenExpiry() {
  return new Date(Date.now() + 1000 * 60 * 60 * 24);
}
