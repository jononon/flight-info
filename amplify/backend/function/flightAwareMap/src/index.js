
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
  prefixUrl: "https://aeroapi.flightaware.com/aeroapi",
  headers: {
    "x-apikey": secrets[process.env.flightaware_api_key]
  }
})

/**
 * @type {import('@types/aws-lambda').APIGatewayProxyHandler}
 */
const handler = async (event) => {
    console.log(`EVENT: ${JSON.stringify(event)}`);

    const fa_flight_id = event.pathParameters.fa_flight_id;
    const height = event.queryParameters.height;
    const width = event.queryParameters.width;

    const map = flightAwareClient.get(`flights/${fa_flight_id}?height=${height}&width=${width}`).json()


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
