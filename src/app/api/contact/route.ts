import nodemailer from "nodemailer";
import { NextRequest, NextResponse } from "next/server";

const MAX_NAME = 200;
const MAX_SUBJECT = 200;
const MAX_MESSAGE = 10000;

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body." },
      { status: 400 }
    );
  }

  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid payload." }, { status: 400 });
  }

  const { name, email, subject, message } = body as Record<string, unknown>;

  const nameStr = typeof name === "string" ? name.trim() : "";
  const emailStr = typeof email === "string" ? email.trim() : "";
  const subjectStr =
    typeof subject === "string" ? subject.trim() : "";
  const messageStr = typeof message === "string" ? message.trim() : "";

  if (!nameStr || !emailStr || !messageStr) {
    return NextResponse.json(
      { error: "Name, email, and message are required." },
      { status: 400 }
    );
  }

  if (nameStr.length > MAX_NAME || subjectStr.length > MAX_SUBJECT) {
    return NextResponse.json(
      { error: "One or more fields are too long." },
      { status: 400 }
    );
  }

  if (messageStr.length > MAX_MESSAGE) {
    return NextResponse.json(
      { error: "Message is too long." },
      { status: 400 }
    );
  }

  if (!EMAIL_REGEX.test(emailStr)) {
    return NextResponse.json(
      { error: "Please enter a valid email address." },
      { status: 400 }
    );
  }

  const to = process.env.CONTACT_TO_EMAIL || "njayasalazar@gmail.com";
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;

  if (!smtpUser || !smtpPass) {
    console.error(
      "Contact API: missing SMTP_USER or SMTP_PASS in environment variables."
    );
    return NextResponse.json(
      {
        error:
          "Email is not configured on the server. Add SMTP_USER and SMTP_PASS to .env.local (see .env.example).",
      },
      { status: 503 }
    );
  }

  const host = process.env.SMTP_HOST || "smtp.gmail.com";
  const port = Number(process.env.SMTP_PORT) || 465;
  const secure =
    process.env.SMTP_SECURE === "true" ||
    (process.env.SMTP_SECURE !== "false" && port === 465);

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    ...(port === 587 ? { requireTLS: true } : {}),
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
  });

  const mailSubject = subjectStr
    ? `[Portfolio] ${subjectStr}`
    : `[Portfolio] Message from ${nameStr}`;

  const safeName = escapeHtml(nameStr);
  const safeEmail = escapeHtml(emailStr);
  const safeBody = escapeHtml(messageStr).replace(/\n/g, "<br/>");

  try {
    await transporter.sendMail({
      from: `"Portfolio contact" <${smtpUser}>`,
      to,
      replyTo: emailStr,
      subject: mailSubject,
      text: [
        `From: ${nameStr} <${emailStr}>`,
        subjectStr ? `Subject: ${subjectStr}` : "",
        "",
        messageStr,
      ]
        .filter(Boolean)
        .join("\n"),
      html: `
        <p><strong>From:</strong> ${safeName} &lt;${safeEmail}&gt;</p>
        ${subjectStr ? `<p><strong>Subject:</strong> ${escapeHtml(subjectStr)}</p>` : ""}
        <hr style="border:none;border-top:1px solid #eee;margin:16px 0;" />
        <p style="white-space:pre-wrap;">${safeBody}</p>
      `,
    });
  } catch (err) {
    console.error("Nodemailer error:", err);
    return NextResponse.json(
      {
        error:
          "Could not send the message. Check SMTP settings or try again later.",
      },
      { status: 502 }
    );
  }

  return NextResponse.json({
    ok: true,
    message: "Message sent successfully.",
  });
}
