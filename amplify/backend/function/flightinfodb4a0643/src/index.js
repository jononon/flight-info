import got from 'got';
import { SSMClient, GetParametersCommand } from "@aws-sdk/client-ssm";

const client = new SSMClient();
const command = new GetParametersCommand({
  Names: [`tripit_username`,`tripit_password`].map(secretName => process.env[secretName]),
  WithDecryption: true,
});
const {Parameters} = await client.send(command);

// Parameters will be of the form { Name: 'secretName', Value: 'secretValue', ... }[]

const secrets = Parameters.reduce((acc, val) => {
  let {Name, Value} = val;
  return {...acc, [Name]: Value}
}, {})

const tripItClient = got.extend({
  prefixUrl: "https://api.tripit.com/v1/",
  username: secrets[process.env.tripit_username],
  password: secrets[process.env.tripit_password]
})

/**
 * @type {import('@types/aws-lambda').APIGatewayProxyHandler}
 */
const handler = async (event) => {
    console.log(`EVENT: ${JSON.stringify(event)}`);

    const data = await tripItClient.get('list/object/type/air?format=json').json();

    console.log(data);

    const segments = [];

    for (const flight of data["AirObject"]) {
      if (!Array.isArray(flight["Segment"])) {
        segments.push(flight["Segment"])
      } else {
        for(const segment of flight["Segment"])
          segments.push(segment)
      }
    }
    console.log(segments);
    
    segments.sort((a, b) => {
      const timeStringA = a["StartDateTime"]["date"] + "T" + a["StartDateTime"]["time"]+a["StartDateTime"]["utc_offset"];
      const timeStringB = b["StartDateTime"]["date"] + "T" + b["StartDateTime"]["time"]+b["StartDateTime"]["utc_offset"];
      
      const timeA = new Date(timeStringA);
      const timeB = new Date(timeStringB);
      
      return timeA - timeB;
    });
    
    console.log(segments);
    // switch(event.httpMethod) {

    // }

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "*"
      }, 
      body: JSON.stringify(segments),
    };
};

export {handler};
