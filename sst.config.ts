import { SSTConfig } from 'sst';
import { NextjsSite } from 'sst/constructs';

export default {
  config(_input) {
    return {
      name: 'streamline-analyst',
      region: 'us-east-1',
    };
  },
  stacks(app) {
    app.stack(function Site({ stack }) {
      const site = new NextjsSite(stack, 'site', {
        environment: {
          GROQ_API_KEY: process.env.GROQ_API_KEY!,
          AWS_DYNAMODB_TABLE_NAME: process.env.AWS_DYNAMODB_TABLE_NAME!,
          AWS_S3_BUCKET_NAME: process.env.AWS_S3_BUCKET_NAME!,
          JWT_SECRET: process.env.JWT_SECRET!,
        },
      });

      stack.addOutputs({
        SiteUrl: site.url,
      });
    });
  },
} satisfies SSTConfig;
