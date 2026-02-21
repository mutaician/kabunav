// SMS utility using Africa's Talking API
// For sandbox testing, ensure your phone is registered at https://simulator.africastalking.com/

import AfricasTalking from "africastalking";

// Initialize Africa's Talking with sandbox credentials
const africastalking = AfricasTalking({
  apiKey: process.env.NEXT_AT_API_KEY!,
  username: "sandbox", // Use "sandbox" for testing
});

const sms = africastalking.SMS;

export interface SMSResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * Send SMS to a single recipient
 */
export async function sendSMS(
  to: string,
  message: string
): Promise<SMSResult> {
  // Validate phone number format (should be +254...)
  if (!to || !to.startsWith("+")) {
    return { success: false, error: "Invalid phone number format. Use international format (e.g., +254712345678)" };
  }

  if (!message || message.trim().length === 0) {
    return { success: false, error: "Message cannot be empty" };
  }

  try {
    const result = await sms.send({
      to: [to],
      message: message,
      // Note: In sandbox, messages go to the simulator, not real phones
    });

    console.log("[SMS] Send result:", JSON.stringify(result, null, 2));

    // Check if any messages were sent successfully
    const recipients = result.SMSMessageData?.Recipients || [];
    if (recipients.length > 0 && recipients[0].status === "Success") {
      return {
        success: true,
        messageId: recipients[0].messageId,
      };
    }

    // Handle specific error statuses
    if (recipients.length > 0) {
      return {
        success: false,
        error: `SMS failed: ${recipients[0].status}`,
      };
    }

    return { success: false, error: "No recipients processed" };
  } catch (error) {
    console.error("[SMS] Error sending SMS:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error sending SMS",
    };
  }
}

/**
 * Send SMS to multiple recipients
 */
export async function sendBulkSMS(
  recipients: string[],
  message: string
): Promise<{ sent: number; failed: number; errors: string[] }> {
  const validRecipients = recipients.filter(
    (phone) => phone && phone.startsWith("+")
  );

  if (validRecipients.length === 0) {
    return { sent: 0, failed: recipients.length, errors: ["No valid phone numbers"] };
  }

  try {
    const result = await sms.send({
      to: validRecipients,
      message: message,
    });

    console.log("[SMS] Bulk send result:", JSON.stringify(result, null, 2));

    const messageData = result.SMSMessageData?.Recipients || [];
    const sent = messageData.filter((r: { status: string }) => r.status === "Success").length;
    const failed = messageData.filter((r: { status: string }) => r.status !== "Success").length;
    const errors = messageData
      .filter((r: { status: string }) => r.status !== "Success")
      .map((r: { number: string; status: string }) => `${r.number}: ${r.status}`);

    return { sent, failed, errors };
  } catch (error) {
    console.error("[SMS] Error sending bulk SMS:", error);
    return {
      sent: 0,
      failed: validRecipients.length,
      errors: [error instanceof Error ? error.message : "Unknown error"],
    };
  }
}

/**
 * Send class confirmation SMS to students
 */
export async function notifyClassConfirmedSMS(
  phoneNumbers: string[],
  courseCode: string,
  courseName: string,
  time: string,
  venue?: string
): Promise<{ sent: number; failed: number }> {
  const message = `✅ KabuNav: ${courseCode} - ${courseName} is CONFIRMED for ${time}${venue ? ` at ${venue}` : ""}. See you in class!`;
  
  const result = await sendBulkSMS(phoneNumbers, message);
  console.log(`[SMS] Class confirmation sent to ${result.sent}/${phoneNumbers.length} students`);
  return { sent: result.sent, failed: result.failed };
}

/**
 * Send class cancellation SMS to students
 */
export async function notifyClassCancelledSMS(
  phoneNumbers: string[],
  courseCode: string,
  courseName: string,
  reason?: string
): Promise<{ sent: number; failed: number }> {
  const message = `❌ KabuNav: ${courseCode} - ${courseName} has been CANCELLED.${reason ? ` Reason: ${reason}` : ""} Check app for updates.`;
  
  const result = await sendBulkSMS(phoneNumbers, message);
  console.log(`[SMS] Class cancellation sent to ${result.sent}/${phoneNumbers.length} students`);
  return { sent: result.sent, failed: result.failed };
}
