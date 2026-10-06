import nodemailer from "nodemailer";

export const THAI_TIME_ZONE = "Asia/Bangkok";

export function formatThaiTime(date: Date): string {
  return new Intl.DateTimeFormat("th-TH", {
    timeZone: THAI_TIME_ZONE,
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(date);
}

export function formatThaiDate(date: Date): string {
  return new Intl.DateTimeFormat("th-TH", {
    timeZone: THAI_TIME_ZONE,
    dateStyle: "long",
  }).format(date);
}

export interface BookingEmailPayload {
  to: string;
  userName: string;
  roomName: string;
  roomLocation?: string;
  topic: string;
  startTime: Date;
  endTime: Date;
  status: "APPROVED" | "REJECTED" | "PENDING";
  adminNote?: string | null;
}

export function getEmailTransporter() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT) || 587;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASSWORD;

  if (!host || !user || !pass) {
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });
}

export async function sendBookingReviewEmail(payload: BookingEmailPayload): Promise<{ success: boolean; simulated: boolean }> {
  const transporter = getEmailTransporter();
  const from = process.env.SMTP_FROM || '"MEETSYNC System" <noreply@cmu.ac.th>';
  const isApproved = payload.status === "APPROVED";
  const statusLabel = isApproved ? "อนุมัติแล้ว" : payload.status === "REJECTED" ? "ไม่อนุมัติ" : "รอตรวจสอบ";
  const subject = `[MEETSYNC] แจ้งผลคำขอจองห้องประชุม: ${payload.topic} (${statusLabel})`;

  const dateText = formatThaiDate(payload.startTime);
  const timeText = `${formatThaiTime(payload.startTime)} – ${formatThaiTime(payload.endTime)} น.`;

  const html = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e1e6f0; border-radius: 16px; background-color: #ffffff; color: #17243c;">
      <div style="border-bottom: 2px solid #edf2ff; padding-bottom: 16px; margin-bottom: 20px;">
        <h2 style="margin: 0; color: #2458e8; font-size: 22px;">MEETSYNC · แจ้งผลคำขอจองห้องประชุม</h2>
        <p style="margin: 4px 0 0; color: #677287; font-size: 14px;">วิทยาลัยนวัตกรรมดิจิทัล มหาวิทยาลัยเชียงใหม่</p>
      </div>

      <p style="font-size: 16px;">เรียนคุณ <strong>${payload.userName}</strong>,</p>
      
      <p style="font-size: 15px; line-height: 1.6;">
        คำขอจองห้องประชุมสำหรับหัวข้อ "<strong>${payload.topic}</strong>" ของคุณได้รับการพิจารณาแล้ว โดยมีผลดังนี้:
      </p>

      <div style="padding: 16px; border-radius: 12px; margin: 20px 0; background-color: ${isApproved ? "#ecfdf5" : "#fff1f2"}; border: 1px solid ${isApproved ? "#a7f3d0" : "#fecdd3"};">
        <span style="display: block; font-size: 12px; font-weight: 600; text-transform: uppercase; color: ${isApproved ? "#047857" : "#be123c"};">ผลการพิจารณา</span>
        <span style="display: block; font-size: 20px; font-weight: 700; color: ${isApproved ? "#065f46" : "#9f1239"}; margin-top: 4px;">${statusLabel}</span>
      </div>

      <div style="background-color: #f7f8fc; border-radius: 12px; padding: 18px; margin-bottom: 20px; font-size: 14px; line-height: 1.8;">
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="color: #677287; width: 35%; padding-bottom: 6px;">ห้องประชุม:</td>
            <td style="font-weight: 600; color: #17243c; padding-bottom: 6px;">${payload.roomName} ${payload.roomLocation ? `(${payload.roomLocation})` : ""}</td>
          </tr>
          <tr>
            <td style="color: #677287; padding-bottom: 6px;">วันที่ใช้งาน:</td>
            <td style="font-weight: 600; color: #17243c; padding-bottom: 6px;">${dateText}</td>
          </tr>
          <tr>
            <td style="color: #677287; padding-bottom: 6px;">ช่วงเวลา:</td>
            <td style="font-weight: 600; color: #17243c; padding-bottom: 6px;">${timeText}</td>
          </tr>
          ${payload.adminNote ? `
          <tr>
            <td style="color: #677287; padding-top: 6px; vertical-align: top;">หมายเหตุผู้ดูแล:</td>
            <td style="color: #b32942; font-weight: 500; padding-top: 6px;">${payload.adminNote}</td>
          </tr>
          ` : ""}
        </table>
      </div>

      <p style="font-size: 13px; color: #677287; line-height: 1.5;">
        คุณสามารถเข้าสู่ระบบเพื่อตรวจสอบสถานะการจองหรือพิมพ์ใบยืนยันได้ที่เมนู <strong>"การจองของฉัน"</strong> บนเว็บไซต์ MEETSYNC
      </p>

      <hr style="border: 0; border-top: 1px solid #e1e6f0; margin: 24px 0;" />
      <p style="font-size: 11px; color: #9ca3af; text-align: center; margin: 0;">
        อีเมลนี้เป็นข้อความอัตโนมัติจากระบบ MEETSYNC กรุณาอย่าตอบกลับอีเมลนี้
      </p>
    </div>
  `;

  const text = `MEETSYNC · แจ้งผลคำขอจองห้องประชุม\n` +
    `เรียนคุณ ${payload.userName}\n\n` +
    `หัวข้อการประชุม: ${payload.topic}\n` +
    `ห้องประชุม: ${payload.roomName}\n` +
    `วันที่: ${dateText}\n` +
    `เวลา: ${timeText}\n` +
    `ผลการพิจารณา: ${statusLabel}\n` +
    (payload.adminNote ? `หมายเหตุผู้ดูแล: ${payload.adminNote}\n` : "") +
    `\nสามารถตรวจสอบรายการจองได้ที่เมนูการจองของฉันในระบบ MEETSYNC`;

  if (!transporter) {
    console.log(`[SIMULATED EMAIL] To: ${payload.to} | Subject: ${subject}\n${text}`);
    return { success: true, simulated: true };
  }

  try {
    await transporter.sendMail({
      from,
      to: payload.to,
      subject,
      text,
      html,
    });
    return { success: true, simulated: false };
  } catch (error) {
    console.error("Failed to send review email via SMTP:", error);
    return { success: false, simulated: false };
  }
}
