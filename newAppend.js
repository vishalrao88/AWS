
const {google} = require('googleapis');
const fs = require('fs').promises;
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];  
const TOKEN_PATH = 'token.json';// If modifying these scopes, delete token.json.

main();


async function main () {
  const auth = await authorize();
 
  const sheets =  google.sheets({version: 'v4', auth});

  let values = [
  [
    "34","2225"// Cell values ...
  ],
  // Additional rows ...
  ];
  const resource = {
    values,
  };

  const request = {
    spreadsheetId: '1bf53ZH25ACHpSb9CwgF75TrpTAPmMWrgfP7R5UHajW0',
    range: 'A2:E', 
    valueInputOption: 'USER_ENTERED',
    resource,
    auth,
  };


  try {
    const response = (await sheets.spreadsheets.values.append(request)).data;
    console.log(JSON.stringify(response, null, 2));
  } catch (err) {
    console.error(err);
  }
  
}


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

