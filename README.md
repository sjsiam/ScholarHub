## Live deployment (AWS Academy Learner Lab, us-east-1)

- Frontend: http://scholarhub-frontend-672222938645.s3-website-us-east-1.amazonaws.com
- API: https://jdvmmrxr2i.execute-api.us-east-1.amazonaws.com
- Cognito User Pool: us-east-1_DQxvoNEAv
- CloudWatch dashboard: ScholarHub

## Deploying the frontend

```bash
cd frontend
npm run build
aws s3 sync out/ s3://scholarhub-frontend-672222938645 --delete
```

## Learner Lab notes

- SES (email) and CloudFront are blocked in Learner Lab; the Notification Service logs notifications instead of emailing, and the frontend is served via S3 website hosting.
- CLI credentials expire with each lab session; refresh `~/.aws/credentials` from AWS Details.