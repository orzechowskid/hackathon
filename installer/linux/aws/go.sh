#!/bin/bash -x

USERNAME=alewife-user
DYNAMO_POLICY_ARN=arn:aws:iam::aws:policy/AmazonDynamoDBFullAccess
EC2_POLICY_ARN=arn:aws:iam::aws:policy/AmazonEC2FullAccess
S3_POLICY_ARN=arn:aws:iam::aws:policy/AmazonS3FullAccess
PUBLIC_SUBNET_CIDR=10.0.1.0/24
PRIVATE_SUBNET_CIDR=10.0.0.0/24

aws iam get-user --user-name $USERNAME &> /dev/null

if [ $? == 0 ]; then
    echo "Found existing restricted user"
else
    echo "Creating new restricted user..."
    aws iam create-user --user-name $USERNAME &> /dev/null
fi

echo "Assigning policies to restricted user..."
aws iam attach-user-policy --user-name $USERNAME --policy-arn $DYNAMO_POLICY_ARN &> /dev/null
aws iam attach-user-policy --user-name $USERNAME --policy-arn $EC2_POLICY_ARN &> /dev/null
aws iam attach-user-policy --user-name $USERNAME --policy-arn $S3_POLICY_ARN &> /dev/null

echo "Creating access key for restricted user..."
CREDS_JSON=$(aws iam create-access-key --user-name $USERNAME --output json)
# echo "Switching to restricted user..."
# AWS_ACCESS_KEY_ID=`echo $CREDS_JSON | jq -r '.AccessKey.AccessKeyId'`
# AWS_SECRET_ACCESS_KEY=`echo $CREDS_JSON | jq -r '.AccessKey.SecretAccessKey'`
# unset CREDS_JSON

echo "Creating EC2 VPC..."
VPC_ID=`aws ec2 create-vpc --cidr-block 10.0.0.0/16 --query Vpc.VpcId --output text`
aws ec2 create-subnet --vpc-id $VPC_ID --cidr-block $PUBLIC_SUBNET_CIDR
aws ec2 create-subnet --vpc-id $VPC_ID --cidr-block $PRIVATE_SUBNET_CIDR

echo "Creating gateway..."
GATEWAY_ID=`aws ec2 create-internet-gateway --query InternetGateway.InternetGatewayId --output text`
aws ec2 attach-internet-gateway --vpc-id $VPC_ID --internet-gateway-id $GATEWAY_ID

echo "Creating route table..."
ROUTE_TABLE_ID=`aws ec2 create-route-table --vpc-id $VPC_ID --query RouteTable.RouteTableId --output text`
aws ec2 create-route --route-table-id $ROUTE_TABLE_ID --destination-cidr-block 0.0.0.0/0 --gateway-id $GATEWAY_ID

PUBLIC_SUBNET_ID=`aws ec2 describe-subnets --filters "Name=vpc-id,Values=$VPC_ID" --query "Subnets[?CidrBlock=='$PUBLIC_SUBNET_CIDR'].SubnetId" --output text`
aws ec2 associate-route-table --subnet-id $PUBLIC_SUBNET_ID --route-table-id $ROUTE_TABLE_ID
aws ec2 modify-subnet-attribute --subnet-id $PUBLIC_SUBNET_ID --map-public-ip-on-launch

echo "Creating EC2 security group..."
SECURITY_GROUP_ID=`aws ec2 create-security-group --group-name alewife-sg --description "Alewife EC2 security group" --vpc-id $VPC_ID --output text`

# echo "Creating SSH key pair..."
# aws ec2 create-key-pair --key-name AlewifeKeyPair --query "KeyMaterial" --output text > AlewifeKeyPair.pem
