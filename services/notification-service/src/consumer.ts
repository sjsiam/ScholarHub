import { SQSClient, ReceiveMessageCommand, DeleteMessageCommand, Message } from "@aws-sdk/client-sqs";
import { randomUUID } from "crypto";

const client = new SQSClient({ region: process.env.AWS_REGION || "us-east-1" });
const QUEUE_URL = process.env.NOTIFICATION_QUEUE_URL;

async function handleMessage(message: Message): Promise<void> {
  const event = JSON.parse(message.Body ?? "{}");

  if (event["detail-type"] !== "ScholarshipCreated") {
    console.warn("Ignoring unknown event type:", event["detail-type"]);
    return;
  }

  const s = event.detail;

  const notification = {
    id: randomUUID(),
    userId: "all-users",
    subject: `New Scholarship: ${s.title}`,
    message: `${s.organization} posted "${s.title}" (${s.degreeLevel}, ${s.country}). Deadline: ${s.deadline}.`,
    status: "queued",
    source: "ScholarshipCreated",
    createdAt: new Date().toISOString(),
  };

  // Email sending (SES) would go here; Learner Lab blocks SES, so we log instead
  console.log("Notification created from event:", JSON.stringify(notification));
}

export async function startConsumer(): Promise<void> {
  if (!QUEUE_URL) {
    console.warn("NOTIFICATION_QUEUE_URL not set; SQS consumer disabled");
    return;
  }

  console.log(`SQS consumer started, polling ${QUEUE_URL}`);

  while (true) {
    try {
      const res = await client.send(
        new ReceiveMessageCommand({
          QueueUrl: QUEUE_URL,
          MaxNumberOfMessages: 10,
          WaitTimeSeconds: 20, // long polling: fewer empty requests, lower cost
        })
      );

      for (const m of res.Messages ?? []) {
        try {
          await handleMessage(m);
          await client.send(
            new DeleteMessageCommand({ QueueUrl: QUEUE_URL, ReceiptHandle: m.ReceiptHandle! })
          );
        } catch (err) {
          // Not deleted → SQS retries it; after 3 failures it moves to the DLQ
          console.error(`Failed to process message ${m.MessageId}; will retry`, err);
        }
      }
    } catch (err) {
      console.error("Error polling SQS:", err);
      await new Promise((r) => setTimeout(r, 5000));
    }
  }
}