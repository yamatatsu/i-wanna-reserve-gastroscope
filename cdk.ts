import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as nodejs from "aws-cdk-lib/aws-lambda-nodejs";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import * as events from "aws-cdk-lib/aws-events";
import * as targets from "aws-cdk-lib/aws-events-targets";

const SLACK_WEBHOOK_URL = process.env.SLACK_WEBHOOK_URL;

class Stack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    if (!SLACK_WEBHOOK_URL) {
      throw Error("You should set SLACK_WEBHOOK_URL");
    }

    const table = new dynamodb.Table(this, "Table", {
      tableName: "i-wanna-reserve-gastroscope",
      partitionKey: {
        name: "pk",
        type: dynamodb.AttributeType.STRING,
      },
    });

    const handler = new nodejs.NodejsFunction(this, "Lambda", {
      functionName: "i-wanna-reserve-gastroscope",
      entry: "src/handler.ts",
      runtime: lambda.Runtime.NODEJS_18_X,
      environment: { SLACK_WEBHOOK_URL, TABLE_NAME: table.tableName },
    });
    table.grantReadWriteData(handler);

    new events.Rule(this, "EventBridgeRule", {
      schedule: events.Schedule.rate(cdk.Duration.hours(1)),
      targets: [new targets.LambdaFunction(handler)],
    });
  }
}

const app = new cdk.App();
new Stack(app, "IWannaReserveGastroscopeStack", {});
