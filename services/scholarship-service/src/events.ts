import { EventBridgeClient, PutEventsCommand } from "@aws-sdk/client-eventbridge";

const client = new EventBridgeClient({
  region: process.env.AWS_REGION || "us-east-1",
});

const EVENT_BUS_NAME = process.env.EVENT_BUS_NAME || "scholarhub-bus";

interface ScholarshipEventData {
  id: string;
  title: string;
  organization: string;
  country: string;
  degreeLevel: string;
  fieldOfStudy: string;
  deadline: string;
}

export async function publishScholarshipCreated(s: ScholarshipEventData): Promise<void> {
  try {
    const result = await client.send(
      new PutEventsCommand({
        Entries: [
          {
            EventBusName: EVENT_BUS_NAME,
            Source: "scholarhub.scholarship-service",
            DetailType: "ScholarshipCreated",
            Detail: JSON.stringify({
              id: s.id,
              title: s.title,
              organization: s.organization,
              country: s.country,
              degreeLevel: s.degreeLevel,
              fieldOfStudy: s.fieldOfStudy,
              deadline: s.deadline,
            }),
          },
        ],
      })
    );

    if (result.FailedEntryCount && result.FailedEntryCount > 0) {
      console.error("EventBridge rejected ScholarshipCreated event:", result.Entries);
    } else {
      console.log(`Published ScholarshipCreated event for ${s.id}`);
    }
  } catch (err) {
    // Event publishing must not break scholarship creation
    console.error("Failed to publish ScholarshipCreated event:", err);
  }
}