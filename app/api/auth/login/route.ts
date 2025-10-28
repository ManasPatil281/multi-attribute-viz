import { NextRequest, NextResponse } from 'next/server';
import {
  CognitoIdentityProviderClient,
  InitiateAuthCommand,
  RespondToAuthChallengeCommand,
  GetUserCommand,
} from '@aws-sdk/client-cognito-identity-provider';
import crypto from 'crypto';
import { updateLastLogin, saveUserToDynamoDB } from '@/lib/user-service';

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
    const { username, password, newPassword, session } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password are required' },
        { status: 400 }
      );
    }

    const secretHash = calculateSecretHash(username);

    // Handle new password challenge response
    if (newPassword && session) {
      const command = new RespondToAuthChallengeCommand({
        ClientId: CLIENT_ID,
        ChallengeName: 'NEW_PASSWORD_REQUIRED',
        Session: session,
        ChallengeResponses: {
          USERNAME: username,
          NEW_PASSWORD: newPassword,
          SECRET_HASH: secretHash,
        },
      });

      const result = await cognitoClient.send(command);

      if (result.AuthenticationResult) {
        const userInfo = await getUserInfo(result.AuthenticationResult.AccessToken!);

        return NextResponse.json({
          accessToken: result.AuthenticationResult.AccessToken!,
          refreshToken: result.AuthenticationResult.RefreshToken!,
          idToken: result.AuthenticationResult.IdToken!,
          user: userInfo,
        });
      }
    }

    // Initial authentication
    const command = new InitiateAuthCommand({
      ClientId: CLIENT_ID,
      AuthFlow: 'USER_PASSWORD_AUTH',
      AuthParameters: {
        USERNAME: username,
        PASSWORD: password,
        SECRET_HASH: secretHash,
      },
    });

    const result = await cognitoClient.send(command);

    if (result.AuthenticationResult) {
      const userInfo = await getUserInfo(result.AuthenticationResult.AccessToken!);

      // Update last login in DynamoDB
      if (userInfo?.sub) {
        try {
          // Try to update, or create if doesn't exist
          await updateLastLogin(userInfo.sub);
        } catch (dbError) {
          console.error('Failed to update last login:', dbError);
        }
      }

      return NextResponse.json({
        accessToken: result.AuthenticationResult.AccessToken!,
        refreshToken: result.AuthenticationResult.RefreshToken!,
        idToken: result.AuthenticationResult.IdToken!,
        user: userInfo,
      });
    } else if (result.ChallengeName === 'NEW_PASSWORD_REQUIRED') {
      return NextResponse.json(
        {
          challenge: 'NEW_PASSWORD_REQUIRED',
          session: result.Session,
          message: 'Please set a new password',
        },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        { error: 'Authentication failed' },
        { status: 401 }
      );
    }
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: error.message || 'Login failed' },
      { status: 401 }
    );
  }
}

async function getUserInfo(accessToken: string) {
  try {
    const command = new GetUserCommand({
      AccessToken: accessToken,
    });

    const result = await cognitoClient.send(command);

    const attributes = result.UserAttributes || [];
    const username = result.Username!;

    const email = attributes.find(attr => attr.Name === 'email')?.Value || '';
    const name = attributes.find(attr => attr.Name === 'name')?.Value || '';
    const sub = attributes.find(attr => attr.Name === 'sub')?.Value || '';

    return {
      username,
      email,
      name,
      sub,
    };
  } catch (error) {
    console.error('Get user info error:', error);
    return null;
  }
}
