// const Razorpay = require("razorpay");
// import { db } from "../db";
// import { payments } from "../schema";
// import { eq } from "drizzle-orm";

// const razorpay = new Razorpay({
//   key_id: process.env.RAZORPAY_KEY_ID!,
//   key_secret: process.env.RAZORPAY_KEY_SECRET!,
// });

// export async function createOrder(
//   userId: string,
//   amount: number,
//   currency: string,
//   receipt: string,
//   notes?: any
// ) {
//   const options = {
//     amount: amount * 100, // paise
//     currency,
//     receipt,
//     notes,
//   };

//   const order = await razorpay.orders.create(options);

//   const data = await db
//     .insert(payments)
//     .values({
//       userId,
//       orderId: order.id,
//       amount: amount.toString(),
//       currency,
//       receipt,
//       notes,
//       status: order.status ?? "created",
//     })
//     .returning();

//   return data;
// }

// export async function getOrder(orderId: string) {
//   const [order] = await db
//     .select()
//     .from(payments)
//     .where(eq(payments.orderId, orderId));

//   return order;
// }

// export async function isSignatureVerified(razorpay_order_id: string) {
//   const order = await db
//     .select()
//     .from(payments)
//     .where(eq(payments.orderId, razorpay_order_id))
//     .limit(1);
//   return order;
// }

// export async function updatePaymentForOrderVerified(
//   razorpay_order_id: string,
//   razorpay_payment_id: string
// ) {
//   await db
//     .update(payments)
//     .set({
//       status: "paid",
//       paymentId: razorpay_payment_id,
//     })
//     .where(eq(payments.orderId, razorpay_order_id));
// }
