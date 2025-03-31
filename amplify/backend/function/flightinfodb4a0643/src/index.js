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

function removeDuplicateSegments (segments) {
  const segmentMap = {};

  for(segment of segments) {
    segmentMap[JSON.stringify(segment)] = segment
  }

  return segmentMap.values()
}

function tripItDateObjectToDate (tripItDateObject) {
  return new Date(tripItDateObject["date"] + "T" + tripItDateObject["time"]+tripItDateObject["utc_offset"])
}

function extractAirObjects(tripItData) {
  const airObjects = [];

  if (Array.isArray(tripItData["AirObject"])) {
    for(const airObject of tripItData["AirObject"]) {
      airObjects.push(airObject)
    }
  } else {
    airObjects.push(tripItData["AirObject"])
  }

  return airObjects;
}

/**
 * @type {import('@types/aws-lambda').APIGatewayProxyHandler}
 */
const handler = async (event) => {
    console.log(`EVENT: ${JSON.stringify(event)}`);

    const [data, pastData] = await Promise.all([
      tripItClient.get('list/object/type/air?format=json').json(),
      tripItClient.get('list/object/type/air/past/true?format=json').json()
    ]);

    console.log(data);
    console.log(pastData)

    const airObjects = extractAirObjects(data).concat(extractAirObjects(pastData));

    let segments = []
    
    for (const airObject of airObjects) {
      if (Array.isArray(airObject["Segment"])) {
        for(const segment of airObject["Segment"]) {
          segments.push(segment)
        }
      } else {
        segments.push(airObject["Segment"])
      }
    }

    segments = removeDuplicateSegments(segments)

    console.log(segments);
    
    segments.sort((a, b) => {
      const timeA = tripItDateObjectToDate(a["StartDateTime"]);
      const timeB = tripItDateObjectToDate(b["StartDateTime"]);
      
      return timeA - timeB;
    });
    
    console.log(segments);

    const filteredSegments = segments.filter((segment) => {
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



    console.log(filteredSegments);

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "*"
      }, 
      body: JSON.stringify(filteredSegments),
    };
};

export {handler};
