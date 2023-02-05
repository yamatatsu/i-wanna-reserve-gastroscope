import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as nodejs from "aws-cdk-lib/aws-lambda-nodejs";

const SLACK_WEBHOOK_URL = process.env.SLACK_WEBHOOK_URL;

class Stack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    if (!SLACK_WEBHOOK_URL) {
      throw Error("You should set SLACK_WEBHOOK_URL");
    }

    new nodejs.NodejsFunction(this, "Lambda", {
      functionName: "i-wanna-reserve-gastroscope",
      entry: "src/handler.ts",
      runtime: lambda.Runtime.NODEJS_18_X,
      environment: { SLACK_WEBHOOK_URL },
    });
  }
}

const app = new cdk.App();
new Stack(app, "IWannaReserveGastroscopeStack", {});
