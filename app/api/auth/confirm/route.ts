import { NextRequest, NextResponse } from 'next/server';
import {
  CognitoIdentityProviderClient,
  ConfirmSignUpCommand,
} from '@aws-sdk/client-cognito-identity-provider';
import crypto from 'crypto';

const cognitoClient = new CognitoIdentityProviderClient({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    sessionToken: process.env.AWS_SESSION_TOKEN,
  },
});

const CLIENT_ID = process.env.AWS_COGNITO_CLIENT_ID!;
const CLIENT_SECRET = process.env.AWS_COGNITO_CLIENT_SECRET!;

function calculateSecretHash(username: string): string {
  const message = username + CLIENT_ID;
  const hmac = crypto.createHmac('sha256', CLIENT_SECRET);
  hmac.update(message);
  return hmac.digest('base64');
}

export async function POST(request: NextRequest) {
  try {
    const { username, confirmationCode } = await request.json();

    if (!username || !confirmationCode) {
      return NextResponse.json(
        { error: 'Username and confirmation code are required' },
        { status: 400 }
      );
    }

    const secretHash = calculateSecretHash(username);

    const command = new ConfirmSignUpCommand({
      ClientId: CLIENT_ID,
      Username: username,
      ConfirmationCode: confirmationCode,
      SecretHash: secretHash,
    });

    await cognitoClient.send(command);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Confirm signup error:', error);
    return NextResponse.json(
      { error: error.message || 'Confirmation failed' },
      { status: 400 }
    );
  }
}
