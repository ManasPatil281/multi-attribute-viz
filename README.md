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
