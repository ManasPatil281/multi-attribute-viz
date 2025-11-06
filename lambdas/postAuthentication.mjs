import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb';

const client = new DynamoDBClient({ region: process.env.AWS_REGION || 'us-east-1' });
const docClient = DynamoDBDocumentClient.from(client);

export const handler = async (event) => {
  try {
    const user = event.request?.userAttributes ?? {};
    const tableName = process.env.DYNAMODB_TABLE || 'cc-mini-proj-dynamo';

    if (!user.sub) {
      console.warn('PostAuthentication: missing user.sub, skipping DynamoDB write');
      return event;
    }

    // Use userId (user.sub) as partition key since your table schema uses userId (S)
    const item = {
      userId: user.sub,           // Partition key
      username: event.userName,
      email: user.email,
      name: user.name,
      createdAt: new Date().toISOString(),
    };

    await docClient.send(
      new PutCommand({
        TableName: tableName,
        Item: item,
      })
    );

    console.log(`PostAuthentication: user ${event.userName} (${user.sub}) saved to DynamoDB`);
    return event;
  } catch (error) {
    console.error('PostAuthentication handler error:', error);
    throw error;
  }
};
