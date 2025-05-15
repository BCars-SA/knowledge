# Deploying a New ECS Task with GitHub Actions

This guide provides a step-by-step process to create and deploy a new ECS task in AWS using GitHub Actions. It leverages the provided `aws-ecs-task-definition.json` and `build-with-docker-to-aws.yml` files.

## Prerequisites

1. **AWS IAM Role**: Ensure you have an `AWSECSTasksRole` with the `AmazonECSTaskExecutionRolePolicy` attached. This role is required for ECS tasks to pull images and send logs to CloudWatch.
2. **AWS CLI**: Install and configure the AWS CLI with appropriate permissions or use AWS web interface.
3. **AWS IAM User**: Ensure you have an IAM user with roles: `AllowECRPushAndGetAuthorizationToken`, `AllowECSTaskDefinitionManipulations`, `AmazonEC2ContainerRegistryFullAccess`, `AmazonElasticContainerRegistryPublicFullAccess`. Create an access key for this user and store it securely. This key will be used in GitHub Actions to authenticate with AWS.
   

## Steps to Create and Deploy a New ECS Task

### 1. Create a New ECS Cluster

You can either use an existing ECS cluster or create a new one:

```bash
aws ecs create-cluster --cluster-name ExampleCluster
```

### 2. Create a Container Repository

I recommend creating a dedicated container repository for each service:

```bash
aws ecr create-repository --repository-name example-container-repository
```

### 3. Create a Log Group

Create a CloudWatch log group for the service to store logs with 7 days retention, f.e.:

```bash
aws logs create-log-group --log-group-name example-log-group --retention-in-days 7
```

### 4. Prepare the ECS Task Definition

The `aws-ecs-task-definition.json` file defines the ECS task. Key points:
- **Image**: Update the `image` field with the ECR image URI.
- **Log Configuration**: Ensure the `awslogs-group` matches the log group created earlier.
- **Health Check**: Ensure the Docker image includes `curl` for health checks.

### 5. Update the Dockerfile

Ensure your Dockerfile installs `curl` if it is not already included. For example:

```dockerfile
RUN apt-get update && apt-get install -y curl
```

### 6. Configure GitHub Actions

#### Secrets

Add the following secrets to your GitHub repository:
- `AWS_ACCESS_KEY_ID`: Your AWS access key.
- `AWS_SECRET_ACCESS_KEY`: Your AWS secret key.
- `SOME_ARG`: Any additional argument required for the Docker build.

#### Variables

Add the following variables to your GitHub repository:
- `AWS_REGION`: The AWS region (e.g., `eu-central-1`).
- `AWS_ECR`: The ECR registry URI (e.g., `992382760160.dkr.ecr.eu-central-1.amazonaws.com`).

### 7. GitHub Actions Workflow

The `build-with-docker-to-aws.yml` file automates the build, push, and deployment process. Key steps:

1. **AWS Credentials Configuration**:
   ```yaml
   - name: Configure AWS Credentials
     uses: aws-actions/configure-aws-credentials@v4
     with:
       aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
       aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
       aws-region: ${{ vars.AWS_REGION }}
   ```

2. **Docker Build and Push**:
   ```yaml
   - name: "Build and push image to ECR"
     run: |
       docker build --build-arg PORT=5000 --build-arg SOME_ARG=$SOME_ARG -t $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG . -f Dockerfile.node
       docker push $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG
   ```

3. **Update Task Definition**:
   ```yaml
   - name: Fill in the new image ID in the Amazon ECS task definition
     uses: aws-actions/amazon-ecs-render-task-definition@v1
     with:
       task-definition: aws-ecs-task-definition.json
       container-name: backend
       image: ${{ steps.build-image.outputs.image }}
   ```

4. **Deploy to ECS**:
   ```yaml
   - name: Deploy to Amazon ECS
     uses: aws-actions/amazon-ecs-deploy-task-definition@v1
     with:
       task-definition: ${{ steps.task-def.outputs.task-definition }}
       service: ExampleService
       cluster: ExampleCluster
   ```

### 8. Create a new task definition

Create a new ECS task definition using provided or modified task definition file. Adapt the path to your local file if necessary.

```bash
aws ecs register-task-definition \
  --cli-input-json file://aws-ecs-task-definition.json
  --family example-task-definition
```

### 9. Create a New ECS Service

Create a new ECS service using modified task definition
Check AWS documentation for more details on the `network-configuration` parameters, such as subnets and security groups.
If you want to expose the service to the internet, I recommend using Application Load Balancer (ALB) with the ECS service. For simplicity, this example uses `awsvpc` networking mode.

```bash
aws ecs create-service \
  --cluster ExampleCluster \
  --service-name ExampleService \
  --task-definition example-task-definition \
  --desired-count 1 \
  --launch-type FARGATE \
  --network-configuration 'awsvpcConfiguration={subnets=[subnet-abc123],securityGroups=[sg-abc123],assignPublicIp="ENABLED"}'
```

### 10. Verify Deployment

Check the ECS service and task status in the AWS Management Console or using the AWS CLI:

```bash
aws ecs describe-services --cluster ExampleCluster --services ExampleService
```

### Notes

- Ensure the `PORT` environment variable in the task definition matches the port exposed by the Docker container.
- Use the `wait-for-service-stability` option in the GitHub Actions workflow for better deployment monitoring.
- Update the `healthCheck` command in the task definition if the service's health endpoint changes.

By following these steps, you can successfully create and deploy a new ECS task using GitHub Actions.