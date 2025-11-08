import { db } from "../db";
import { privateBankInfo } from "../schema/privateBankInfo";

export async function savePrivateBankInfo(userId: string, data: any) {
  try {
    const cleanedData = {
      ...data,
      dob: data.dob || null,
      joiningDate: data.joiningDate || null,
    };

    const result = await db
      .insert(privateBankInfo)
      .values({
        userId,
        dob: cleanedData.dob,
        address: cleanedData.address || null,
        nationality: cleanedData.nationality || null,
        email: cleanedData.email || null,
        gender: cleanedData.gender || null,
        maritalStatus: cleanedData.maritalStatus || null,
        joiningDate: cleanedData.joiningDate,
        accountNumber: cleanedData.accountNumber || null,
        bankName: cleanedData.bankName || null,
        ifsc: cleanedData.ifsc || null,
        pan: cleanedData.pan || null,
        uan: cleanedData.uan || null,
        empCode: cleanedData.empCode || null,
      })
      .returning();

    return { success: true, data: result[0] };
  } catch (err: any) {
    console.error("Error saving private/bank info:", err);
    return { success: false, error: err.message };
  }
}
