import { NextRequest, NextResponse } from 'next/server';
import {
  CognitoIdentityProviderClient,
  SignUpCommand,
} from '@aws-sdk/client-cognito-identity-provider';
import crypto from 'crypto';
import { saveUserToDynamoDB } from '@/lib/user-service';

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
    const { email, password, name, username } = await request.json();

    if (!email || !password || !name || !username) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    const secretHash = calculateSecretHash(username);

    const command = new SignUpCommand({
      ClientId: CLIENT_ID,
      Username: username,
      Password: password,
      SecretHash: secretHash,
      UserAttributes: [
        {
          Name: 'email',
          Value: email,
        },
        {
          Name: 'name',
          Value: name,
        },
      ],
    });

    const result = await cognitoClient.send(command);

    // Save user to DynamoDB after successful Cognito signup
    if (result.UserSub) {
      try {
        await saveUserToDynamoDB({
          sub: result.UserSub,
          username,
          email,
          name,
        });
      } catch (dbError) {
        console.error('Failed to save user to DynamoDB:', dbError);
        // Continue anyway - user is created in Cognito
      }
    }

    return NextResponse.json({
      userId: result.UserSub!,
      username,
      email,
      name,
      confirmed: result.UserConfirmed || false,
    });
  } catch (error: any) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: error.message || 'Signup failed' },
      { status: 400 }
    );
  }
}
