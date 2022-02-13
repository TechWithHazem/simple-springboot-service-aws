import * as cdk from '@aws-cdk/core';
import ec2 = require('@aws-cdk/aws-ec2');
import ecs = require('@aws-cdk/aws-ecs');
import ecs_patterns = require('@aws-cdk/aws-ecs-patterns');

export class SpringbootFargateCdkStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    
    const vpc = new ec2.Vpc(this, "example-springboot-application-vpc", {
      maxAzs: 2,
      natGateways: 1
    })
    
    const exampleApplicationCluster = new ecs.Cluster(this, "example-springboot-application-cluster", {
      vpc,
      clusterName: "application-cluster"
    })
    
    const exampleApp = new ecs_patterns.ApplicationLoadBalancedFargateService(this, 'example-springboot-load-balanced-application', {
      cluster: exampleApplicationCluster,
      desiredCount: 2,
      cpu: 256,
      memoryLimitMiB: 512,
      taskImageOptions: {
        image: ecs.ContainerImage.fromAsset('../springboot-application'),
        containerPort: 8080,
      }
    })
    
    exampleApp.targetGroup.configureHealthCheck({
      port: 'traffic-port',
      path: '/actuator/health',
      interval: cdk.Duration.seconds(5),
      timeout: cdk.Duration.seconds(4),
      healthyThresholdCount: 2,
      unhealthyThresholdCount: 2,
      healthyHttpCodes: "200,301,302"
    })
    
    const springbootAutoScaling = exampleApp.service.autoScaleTaskCount({
      maxCapacity: 4,
      minCapacity: 2
    })
    
    springbootAutoScaling.scaleOnCpuUtilization('cpu-autoscaling', {
      targetUtilizationPercent: 45,
      policyName: "cpu-autoscaling-policy",
      scaleInCooldown: cdk.Duration.seconds(30),
      scaleOutCooldown: cdk.Duration.seconds(30)
    })
  }
}
