# Streamline Analyst

Multi-attribute data visualization and analysis platform with AI-powered insights.

## Features

- 📊 Interactive data visualizations
- 🤖 AI-powered data analysis chatbot
- 📈 Statistical insights and quality metrics
- 🔐 User authentication with AWS DynamoDB
- ☁️ CSV file storage in AWS S3

## Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

4. **IMPORTANT**: Fill in your actual credentials in `.env.local`:
   - Get Groq API key from [console.groq.com](https://console.groq.com)
   - Set up AWS credentials (IAM user with S3 and DynamoDB access)
   - Generate a secure JWT secret (min 32 characters random string)
   - **Never commit `.env.local` to git**

5. Set up AWS resources:
   - Create S3 bucket for CSV storage
   - Create DynamoDB table with `username` as partition key

6. Run the development server:
   ```bash
   npm run dev
   ```

## Deployment

### Security Checklist Before Deployment

- [ ] Ensure `.env.local` is in `.gitignore`
- [ ] No secrets committed to repository
- [ ] All environment variables set in deployment platform
- [ ] AWS credentials rotated if accidentally exposed
- [ ] JWT secret is strong (min 32 random characters)

### Using Serverless Framework

1. Install Serverless CLI:
   ```bash
   npm install -g serverless
   ```

2. Configure AWS credentials:
   ```bash
   serverless config credentials --provider aws --key YOUR_KEY --secret YOUR_SECRET
   ```

3. **Set environment variables in your CI/CD or deployment platform**:
   - Do NOT use hardcoded values in serverless.yml
   - Use AWS Secrets Manager or parameter store
   - Or set via CLI: `serverless deploy --param="GROQ_API_KEY=xxx"`

4. Deploy to AWS:
   ```bash
   npm run deploy
   ```

5. Deploy to production:
   ```bash
   npm run deploy:prod
   ```

### Environment Variables for Production

**Never hardcode these values**. Set them in:
- AWS Lambda environment variables (encrypted)
- AWS Secrets Manager
- AWS Systems Manager Parameter Store
- Your CI/CD platform (GitHub Actions secrets, etc.)

Required variables:
- `GROQ_API_KEY`
- `AWS_DYNAMODB_TABLE_NAME`
- `AWS_S3_BUCKET_NAME`
- `JWT_SECRET`
- `AWS_COGNITO_USER_POOL_ID`
- `AWS_COGNITO_CLIENT_ID`
- `AWS_COGNITO_CLIENT_SECRET`

### Remove Deployment

```bash
npm run remove
```

## Environment Variables

See `.env.example` for required environment variables.

## Security

- **Never commit `.env.local` or any files containing secrets**
- Rotate AWS credentials regularly
- Use IAM roles with minimum required permissions
- Enable MFA for AWS accounts
- Use AWS Secrets Manager for production secrets
- Rotate JWT secrets periodically
- Monitor AWS CloudTrail for suspicious activity

## If node/npm not detected in your shell

If your shell can't find node or npm but Node is installed at D:\node, use the provided wrappers from the project root:

- Windows CMD
  - Install deps: run-install.bat
  - Start dev server: run-dev.bat

- PowerShell
  - Start dev server: .\run-dev.ps1

These wrappers invoke D:\node\npm.cmd directly so you don't need to fix PATH immediately. Prefer fixing system PATH if possible (add D:\node to PATH), then use normal npm commands.

## Troubleshooting: Cognito PostAuthentication Lambda error

If your login requests fail with an error like:
- UserLambdaValidationException: PostAuthentication failed with error "exports is not defined in ES module scope"

Cause:
- The Cognito PostAuthentication trigger Lambda is running in an ES module environment while the handler code uses CommonJS-style exports (e.g. `module.exports` or `exports.handler`), causing a runtime validation failure.

Quick fixes:
- Convert the Lambda handler to ES module syntax:
  - Replace CommonJS exports with an ESM export:
    - Example: `export const handler = async (event) => { /* ... */ }`
- Or ensure the Lambda package is built as CommonJS (configure your bundler/transpiler to output CJS for that function or set `"type": "commonjs"` in that function's package.json).
- Re-deploy the PostAuthentication Lambda after the change.

Notes:
- The API now returns a 502 with a clear remediation message when this specific error occurs.
- Do not include secrets in repository files. If any credentials were exposed, rotate them immediately.

Example change for a Lambda handler (ESM):
```js
// index.mjs
export const handler = async (event) => {
  // ... your code ...
  return event;
};
```

If you need help rebuilding or reconfiguring the Lambda packaging, use your build tooling (esbuild/webpack/tsc) to output CommonJS for that function, or update the runtime packaging to match module format.
