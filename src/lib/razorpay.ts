import Razorpay from "razorpay";

function requireEnv(name: "RAZORPAY_KEY_ID" | "RAZORPAY_KEY_SECRET"): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} is not configured`);
  }
  return value;
}

let razorpayInstance: Razorpay | undefined;

export function getRazorpayInstance() {
  if (!razorpayInstance) {
    razorpayInstance = new Razorpay({
      key_id: requireEnv("RAZORPAY_KEY_ID"),
      key_secret: requireEnv("RAZORPAY_KEY_SECRET"),
    });
  }

  return razorpayInstance;
}

export function getRazorpayPublicKey() {
  const key = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
  if (!key) {
    throw new Error("NEXT_PUBLIC_RAZORPAY_KEY_ID is not configured");
  }
  return key;
}

export function getRazorpaySecret() {
  return requireEnv("RAZORPAY_KEY_SECRET");
}
