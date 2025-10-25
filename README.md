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

## Environment Variables

See `.env.example` for required environment variables.

## Security

- Never commit `.env.local` or any files containing secrets
- Rotate AWS credentials regularly
- Use IAM roles with minimum required permissions
