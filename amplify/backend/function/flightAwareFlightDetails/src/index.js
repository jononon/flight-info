
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

    const ident = event.pathParameters.ident;

    let start, end;

    if(event.queryStringParameters !== null) {
      start = event.queryStringParameters.start;
      end = event.queryStringParameters.end;
    }

    try {
      
      const flights = 
      event.queryStringParameters === null ? 
      await flightAwareClient.get(`flights/${ident}`).json() : 
      await flightAwareClient.get(`flights/${ident}?start=${start}&end=${end}`).json();
      
      console.log(flights);
      
      return {
        statusCode: 200,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Headers": "*"
        }, 
        body: JSON.stringify(flights.flights[0]),
      };
    } catch (error) {
      if (error.response) {
        console.error(`Server responded with ${error.response.statusCode}:`, error.response.body);
      } else {
        console.error('Request failed:', error.message);
      }

      throw new Error("");
      
    }
};

export {handler};
