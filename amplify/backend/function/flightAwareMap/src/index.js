/*
Use the following code to retrieve configured secrets from SSM:

const aws = require('aws-sdk');

const { Parameters } = await (new aws.SSM())
  .getParameters({
    Names: ["flightaware_api_key"].map(secretName => process.env[secretName]),
    WithDecryption: true,
  })
  .promise();

Parameters will be of the form { Name: 'secretName', Value: 'secretValue', ... }[]
*/

import got from 'got';
import { SSMClient, GetParametersCommand } from "@aws-sdk/client-ssm";

const client = new SSMClient();
const command = new GetParametersCommand({
  Names: [`flightaware_api_key`].map(secretName => process.env[secretName]),
  WithDecryption: true,
});
const {Parameters} = await client.send(command);

const secrets = Parameters.reduce((acc, val) => {
  let {Name, Value} = val;
  return {...acc, [Name]: Value}
}, {})

const flightAwareClient = got.extend({
  prefixUrl: "https://aeroapi.flightaware.com/aeroapi/",
  headers: {
    "x-apikey": secrets[process.env.flightaware_api_key]
  }
})

/**
 * @type {import('@types/aws-lambda').APIGatewayProxyHandler}
 */
const handler = async (event) => {
    console.log(`EVENT: ${JSON.stringify(event)}`);

    const fa_flight_id = event.pathParameters["fa-flight-id"];
    const height = event.queryStringParameters.height;
    const width = event.queryStringParameters.width;

    const map = await flightAwareClient.get(`flights/${fa_flight_id}/map?height=${height}&width=${width}`).json()


    return {
      statusCode: 200,
      headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Headers": "*"
      }, 
      body: JSON.stringify(map),
    };
};

export {handler};
