import * as fs from "fs";
import * as https from "https";
import { randomBytes } from "crypto";
import { Client, PrivateKey } from '../src';
import {MAIN_TESTNET_NODE_URL} from "../src/parameters";
export const NUM_TEST_ACCOUNTS = 2;
export const IS_BROWSER = global["isBrowser"] === true;
export const TEST_NODE =
  process.env["TEST_NODE"] || MAIN_TESTNET_NODE_URL;

export const agent = IS_BROWSER
  ? undefined
  : new https.Agent({ keepAlive: true });

let testAccounts

async function readFile(filename: string) {
  return new Promise<Buffer>((resolve, reject) => {
    fs.readFile(filename, (error, result) => {
      if (error) {
        reject(error);
      } else {
        resolve(result);
      }
    });
  });
}

async function writeFile(filename: string, data: Buffer) {
  return new Promise<void>((resolve, reject) => {
    fs.writeFile(filename, data, error => {
      if (error) {
        reject(error);
      } else {
        resolve();
      }
    });
  });
}

export function randomString(length: number) {
  return randomBytes(length * 2)
    .toString("base64")
    .replace(/[^0-9a-z]+/gi, "")
    .slice(0, length)
    .toLowerCase();
}

export async function createAccount(): Promise<{
  username: string;
  password: string;
}> {
  const password = randomString(32);
  const username = `dpixa-${randomString(9)}`;

  // Create testnet account and delegate to it
  const client = Client.testnet({ agent });
  const ops = {
    creator: 'initminer',
    username,
    password
  }
  const key = PrivateKey.from('5JNHfZYKGaomSFvd4NUdQ9qMcEAC43kujbfjueTHpVapX1Kzq2n')
  await client.broadcast.createTestAccount(ops, key)
  await client.broadcast.sendOperations([[
    'transfer_to_vesting',
    {
      amount: '100000.000 TESTS',
      from: 'initminer',
      to: username
    }
  ]], key)
  await client.broadcast.transfer({
    from: 'initminer',
    to: username,
    amount: '1000.000 TESTS',
    memo: 'test acc'
  }, key)
  await client.broadcast.transfer({
    from: 'initminer',
    to: username,
    amount: '1000.000 TPS',
    memo: 'test acc'
  }, key)
  return { username, password };
}

export async function getTestnetAccounts(): Promise<
  { username: string; password: string }[]
> {
  if (testAccounts) {
    return testAccounts
  }
  let rv: { username: string; password: string }[] = [];
  while (rv.length < NUM_TEST_ACCOUNTS) {
    rv.push(await createAccount());
  }
  testAccounts = rv
  if (console && console.log) {
    console.log(`CREATED TESTNET ACCOUNTS: ${rv.map(i => i.username)}`);
  }
  return rv;
}
