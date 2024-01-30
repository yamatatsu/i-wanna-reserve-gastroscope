// import * as R from "remeda";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocument } from "@aws-sdk/lib-dynamodb";
import got from "got";
import * as cheerio from "cheerio";

const ORIGIN = "https://ks.its-kenpo.or.jp";
const SLACK_WEBHOOK_URL = process.env.SLACK_WEBHOOK_URL!;
const TABLE_NAME = process.env.TABLE_NAME!;

const doc = DynamoDBDocument.from(new DynamoDBClient({}));

export const handler = async () => {
  const statusText = await getStatusText();

  console.info(statusText);

  const { Item: item } = await doc.get({
    TableName: TABLE_NAME,
    Key: { pk: "latestStatus" },
  });
  const latestStatus: string | null = item?.val ?? null;

  console.info({ item });

  if (statusText === latestStatus) {
    return;
  }

  await Promise.all([
    got.post(SLACK_WEBHOOK_URL, { json: { text: statusText } }),
    doc.put({
      TableName: TABLE_NAME,
      Item: { pk: "latestStatus", val: statusText },
    }),
  ]);
};

export async function getStatusText() {
  const $top = await load(ORIGIN + "/home/index");
  const availabilityPagePath = $top(
    'a:contains("現在の空き状況俯瞰表（2023年度）")'
  ).prop("href");

  const $availability = await load(ORIGIN + availabilityPagePath);
  const statusText = $availability(
    'th:contains("山王　1日人間ドック（胃内視鏡）【午前】")'
  )
    .first()
    .parent()
    .find("td")
    .text();
  return statusText;
}

async function load(url: string) {
  const { body } = await got.get(url);
  return cheerio.load(body);
}
