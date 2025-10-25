import { PutCommand, GetCommand } from '@aws-sdk/lib-dynamodb';
import { docClient, DYNAMODB_TABLE } from './aws-config';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET!;

export interface User {
  username: string;
  email: string;
  password: string;
  name: string;
  createdAt: string;
}

export async function signUp(email: string, password: string, name: string, username: string) {
  // Check if user exists
  const existingUser = await getUserByUsername(username);
  if (existingUser) {
    throw new Error('Username already exists');
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  const user: User = {
    username,
    email,
    password: hashedPassword,
    name,
    createdAt: new Date().toISOString(),
  };

  await docClient.send(
    new PutCommand({
      TableName: DYNAMODB_TABLE,
      Item: user,
    })
  );

  return generateToken(user);
}

export async function login(username: string, password: string) {
  const user = await getUserByUsername(username);
  
  if (!user) {
    throw new Error('Invalid username or password');
  }

  const isValidPassword = await bcrypt.compare(password, user.password);
  
  if (!isValidPassword) {
    throw new Error('Invalid username or password');
  }

  return generateToken(user);
}

async function getUserByUsername(username: string): Promise<User | null> {
  try {
    const result = await docClient.send(
      new GetCommand({
        TableName: DYNAMODB_TABLE,
        Key: { username },
      })
    );

    return result.Item as User | null;
  } catch (error) {
    console.error('DynamoDB error:', error);
    return null;
  }
}

function generateToken(user: User) {
  const token = jwt.sign(
    { username: user.username, email: user.email },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

  return {
    token,
    user: {
      username: user.username,
      email: user.email,
      name: user.name,
    },
  };
}

export function verifyToken(token: string) {
  try {
    return jwt.verify(token, JWT_SECRET) as { username: string; email: string };
  } catch {
    return null;
  }
}
