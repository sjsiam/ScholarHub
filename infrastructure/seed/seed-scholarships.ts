import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, BatchWriteCommand } from '@aws-sdk/lib-dynamodb'
import { MOCK_SCHOLARSHIPS } from '../../frontend/lib/mock/scholarships'

const TABLE_NAME = process.env.TABLE_NAME || 'ScholarshipTable'
const client = DynamoDBDocumentClient.from(new DynamoDBClient({ region: 'us-east-1' }))

async function main() {
  const now = new Date().toISOString()

  const items = MOCK_SCHOLARSHIPS.map((s) => ({
    ...s,
    // Backend's original single-value fields
    degreeLevel: s.degreeLevels[0],
    fieldOfStudy: s.fields[0],
    amount: s.amountLabel,
    createdAt: new Date(s.createdAt).toISOString(),
    updatedAt: now,
  }))

  // DynamoDB accepts max 25 items per batch
  for (let i = 0; i < items.length; i += 25) {
    let requests: Record<string, any> = {
      [TABLE_NAME]: items.slice(i, i + 25).map((Item) => ({ PutRequest: { Item } })),
    }

    // Retry anything DynamoDB couldn't process on the first try
    while (requests && Object.keys(requests).length > 0) {
      const res = await client.send(new BatchWriteCommand({ RequestItems: requests }))
      requests = res.UnprocessedItems ?? {}
      if (Object.keys(requests).length > 0) await new Promise((r) => setTimeout(r, 500))
    }
  }

  console.log(`Seeded ${items.length} scholarships into ${TABLE_NAME}`)
}

main().catch((err) => {
  console.error('Seeding failed:', err)
  process.exit(1)
})