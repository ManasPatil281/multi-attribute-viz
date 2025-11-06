import { NextRequest, NextResponse } from "next/server";
import {
  CognitoIdentityProviderClient,
  InitiateAuthCommand,
} from "@aws-sdk/client-cognito-identity-provider";
import crypto from "crypto";

const REGION = process.env.AWS_REGION || "us-east-1";
const CLIENT_ID = process.env.AWS_COGNITO_CLIENT_ID!;
const CLIENT_SECRET = process.env.AWS_COGNITO_CLIENT_SECRET!;

const cognitoClient = new CognitoIdentityProviderClient({
  region: REGION,
  credentials:
    process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY
      ? {
          accessKeyId: process.env.AWS_ACCESS_KEY_ID,
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
          sessionToken: process.env.AWS_SESSION_TOKEN,
        }
      : undefined,
});

function calculateSecretHash(username: string) {
  if (!CLIENT_SECRET) return undefined;
  const message = username + CLIENT_ID;
  const hmac = crypto.createHmac("sha256", CLIENT_SECRET);
  hmac.update(message);
  return hmac.digest("base64");
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const username = body?.username;
    const password = body?.password;

    if (!username || !password) {
      return NextResponse.json({ error: "Missing username or password" }, { status: 400 });
    }

    const secretHash = calculateSecretHash(username);

    const command = new InitiateAuthCommand({
      AuthFlow: "USER_PASSWORD_AUTH",
      ClientId: CLIENT_ID,
      AuthParameters: {
        USERNAME: username,
        PASSWORD: password,
        ...(secretHash ? { SECRET_HASH: secretHash } : {}),
      },
    });

    const result = await cognitoClient.send(command);

    if (result.AuthenticationResult) {
      return NextResponse.json({
        accessToken: result.AuthenticationResult.AccessToken,
        idToken: result.AuthenticationResult.IdToken,
        refreshToken: result.AuthenticationResult.RefreshToken,
        expiresIn: result.AuthenticationResult.ExpiresIn,
        tokenType: result.AuthenticationResult.TokenType,
        // Add user info from token claims
        user: {
          username: body?.username,
          email: body?.email || 'unknown',
          sub: result.AuthenticationResult.AccessToken, // or decode token to get sub
        },
      });
    }

    // If there's a challenge or no tokens
    return NextResponse.json(
      { message: "Authentication challenge or no tokens returned", detail: result },
      { status: 202 }
    );
  } catch (err: any) {
    console.error("Login error:", err);

    // Specific handling for Cognito PostAuthentication Lambda validation failure
    if (err.name === "UserLambdaValidationException" || err.__type === "UserLambdaValidationException") {
      return NextResponse.json(
        {
          error: "PostAuthentication Lambda validation failed",
          message:
            "Cognito returned UserLambdaValidationException. The PostAuthentication Lambda likely uses CommonJS 'exports' in an ES module runtime.",
          remediation:
            "Update the PostAuthentication Lambda handler to ESM (`export const handler = async (event) => {}`) or ensure the function is built/deployed as CommonJS. Re-deploy the lambda and retry authentication.",
        },
        { status: 502 }
      );
    }

    // Common Cognito auth errors
    if (err.name === "NotAuthorizedException" || err.name === "UserNotFoundException") {
      return NextResponse.json({ error: "Invalid username or password" }, { status: 401 });
    }

    if (err.name === "UserNotConfirmedException") {
      return NextResponse.json({ error: "User not confirmed" }, { status: 403 });
    }

    // Fallback
    return NextResponse.json({ error: err.message || "Authentication failed" }, { status: 500 });
  }
}
