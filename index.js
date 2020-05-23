const fs = require('fs').promises;
const {google} = require('googleapis');
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];  // If modifying these scopes, delete token.json.
const TOKEN_PATH = 'token.json';
const AWS = require('aws-sdk');
AWS.config.update({region: 'us-east-2'});
const ddb =  new AWS.DynamoDB({apiVersion: '2012-08-10'});
var auth;
exports.handler = async (event) => {
     
    if(event.queryStringParameters==null){ 
         event={
                 "queryStringParameters": {
                    "Sensor1": "Test12",
                    "Sensor2": "Test22",
                    "Sensor3": "Test23"
                 }
        };
    }
    else{console.log("No Input");}
    
    var eventString = JSON.stringify(event);
    var jobj = JSON.parse(eventString);
    var k1 = String(jobj.queryStringParameters.Sensor1);
    var k2 = String(jobj.queryStringParameters.Sensor2);
    
    var nowdate1 = new Date(Date.now()- (1000*60*60*6)) ;
    var todayDate = nowdate1.toISOString().slice(0,10);
    var todayTime = nowdate1.toISOString().slice(11,19);
    
    var ddbResource = {
        TableName: 'garden',
        Item: {
            "k": {S: todayDate + " " + todayTime},
            "date":{S: todayDate},
            "time":{S: todayTime},
            "Sensor1":{S: k1},
            "Sensor2":{S: k2}
            
        }
    };

       
    try
    { 
      await updateSheet(todayDate,todayTime,event.queryStringParameters);
    }
    catch(err)
    {
        console.log("Error writing to Google Sheet: "+err);
    }
    
    try
    { 
      await ddb.putItem(ddbResource).promise();
    }
    catch(err)
    {
        console.log("Error writing to DB: "+err);
    }

    const response = {
        statusCode: 200,
        body: JSON.stringify("Date: "+todayDate+". Time: "+todayTime+". Sensor1: "+ k1+". Sensor2: "+k2),
    };
    
    return response;
};



/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
async function authorize() {
  
  const credentials = JSON.parse(await fs.readFile('credentials.json','utf8'));
  const {client_secret, client_id, redirect_uris} = credentials.installed;
  const oAuth2Client =  new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

  var ggg = await fs.readFile(TOKEN_PATH, 'utf8');

  oAuth2Client.setCredentials(JSON.parse(ggg));
  
  if (oAuth2Client == null) {
    throw Error('authentication failed');
  }

  return oAuth2Client;
}




/**
 * Appends date, time and queryStringParameters values to a GoogleSheet
 * @parameters queryStringParameters from API gateway event object
 */
async function updateSheet(todayDate,todayTime,parameters) {
var val=[]
val[0]=todayDate;
val[1]=todayTime;
var co=2;
Object.keys(parameters).forEach(function(key) {
   val[co] = parameters[key];
   co++;
  });

  auth = await authorize();
  const sheets = google.sheets({version: 'v4', auth});
  
  let values = [
  val
  ];
  
   const resource = {
    values,
  };

  
  const request = {
    spreadsheetId: '1bf53ZH25ACHpSb9CwgF75TrpTAPmMWrgfP7R5UHajW0',
    range: 'A2', 
    valueInputOption: 'USER_ENTERED',
    resource,
    auth,
  };

 
  try {
    const response = (await sheets.spreadsheets.values.append(request)).data;
    console.log(JSON.stringify(response, null, 2));
  } 
  catch (err) {
    console.error(err);
  }
  
}