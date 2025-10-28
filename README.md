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

4. Fill in your credentials in `.env.local`:
   - Get Groq API key from [console.groq.com](https://console.groq.com)
   - Set up AWS credentials (IAM user with S3 and DynamoDB access)
   - Generate a secure JWT secret

5. Set up AWS resources:
   - Create S3 bucket for CSV storage
   - Create DynamoDB table with `username` as partition key

6. Run the development server:
   ```bash
   npm run dev
   ```

## Deployment

### Using Serverless Framework

1. Install Serverless CLI:
   ```bash
   npm install -g serverless
   ```

2. Configure AWS credentials:
   ```bash
   serverless config credentials --provider aws --key YOUR_KEY --secret YOUR_SECRET
   ```

3. Deploy to AWS:
   ```bash
   npm run deploy
   ```

4. Deploy to production:
   ```bash
   npm run deploy:prod
   ```

### Environment Variables for Production

Make sure to set these in your AWS Lambda environment or use AWS Secrets Manager:
- `GROQ_API_KEY`
- `AWS_DYNAMODB_TABLE_NAME`
- `AWS_S3_BUCKET_NAME`
- `JWT_SECRET`

### Remove Deployment

```bash
npm run remove
```

## Environment Variables

See `.env.example` for required environment variables.

## Security

- Never commit `.env.local` or any files containing secrets
- Rotate AWS credentials regularly
- Use IAM roles with minimum required permissions
