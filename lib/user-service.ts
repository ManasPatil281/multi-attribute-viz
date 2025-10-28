import { PutCommand, GetCommand } from '@aws-sdk/lib-dynamodb';
import { docClient, DYNAMODB_TABLE } from './aws-config';

export interface UserProfile {
  userId: string; // Cognito sub
  username: string;
  email: string;
  name: string;
  createdAt: string;
  lastLogin?: string;
  preferences?: Record<string, any>;
}

export async function saveUserToDynamoDB(user: {
  sub: string;
  username: string;
  email: string;
  name: string;
}) {
  const userProfile: UserProfile = {
    userId: user.sub,
    username: user.username,
    email: user.email,
    name: user.name,
    createdAt: new Date().toISOString(),
  };

  await docClient.send(
    new PutCommand({
      TableName: DYNAMODB_TABLE,
      Item: userProfile,
    })
  );

  return userProfile;
}

export async function getUserFromDynamoDB(userId: string) {
  const result = await docClient.send(
    new GetCommand({
      TableName: DYNAMODB_TABLE,
      Key: { userId },
    })
  );

  return result.Item as UserProfile | null;
}

export async function updateLastLogin(userId: string) {
  await docClient.send(
    new PutCommand({
      TableName: DYNAMODB_TABLE,
      Item: {
        userId,
        lastLogin: new Date().toISOString(),
      },
    })
  );
}
