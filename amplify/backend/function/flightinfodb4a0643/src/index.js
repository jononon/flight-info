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

function tripItDateObjectToDate (tripItDateObject) {
  return new Date(tripItDateObject["date"] + "T" + tripItDateObject["time"]+tripItDateObject["utc_offset"])
}

/**
 * @type {import('@types/aws-lambda').APIGatewayProxyHandler}
 */
const handler = async (event) => {
    console.log(`EVENT: ${JSON.stringify(event)}`);

    const data = await tripItClient.get('list/object/type/air/past/true?format=json').json();

    console.log(data);

    const airObjects = [];

    if (Array.isArray(data["AirObject"])) {
      for(const airObject of data["AirObject"]) {
        airObjects.push(airObject)
      }
    } else {
      airObjects.push(data["AirObject"])
    }

    const segments = [];
    
    for (const airObject of airObjects) {
      if (Array.isArray(airObject["Segment"])) {
        for(const segment of airObject["Segment"]) {
          segments.push(segment)
        }
      } else {
        segments.push(airObject["Segment"])
      }
    }

    console.log(segments);
    
    segments.sort((a, b) => {
      const timeA = tripItDateObjectToDate(a["StartDateTime"]);
      const timeB = tripItDateObjectToDate(b["StartDateTime"]);
      
      return timeA - timeB;
    });
    
    console.log(segments);

    segments.filter((segment) => {
      let arrivalTime;

      if (segment["Status"]["EstimatedArrivalDateTime"] != undefined) {
        arrivalTime = tripItDateObjectToDate(segment["Status"]["EstimatedArrivalDateTime"])
      } else if (segment["Status"]["ScheduledArrivalDateTime"] != undefined) {
        arrivalTime = tripItDateObjectToDate(segment["Status"]["ScheduledArrivalDateTime"])
      } else {
        arrivalTime = tripItDateObjectToDate(segment["EndDateTime"])
      }

      const cutoff = new Date();
      cutoff.setHours(cutoff.getHours() - 6);

      return arrivalTime >= cutoff;
    })

    console.log(segments);

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
