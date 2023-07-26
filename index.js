const http = require('http');
const fs = require('fs').promises;
const PORT = 3000;
const CREATOR_NAME = "이강록";


const server = http.createServer((request, response) => {
  if (request.method === 'GET') {
        handleGetRequest(request, response);
  } else if (request.method === 'POST') {
        handlePostRequest(request, response);
  } else {
        response.writeHead(405); // Method Not Allowed
        response.end();
  }
});

async function handleGetRequest(request, response) {
    let responseData = '';
    try {
        responseData = await fs.readFile('./club.json', 'utf-8');
        response.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
        response.end(responseData);
    } catch(err) { //In case club.json is missing or smth
        console.log(err);
        response.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
        response.end('Internal Server Error');
    }
}

function handlePostRequest(request, response) {
    let body = '';
    request.on('data', (chunk) => {
        body += chunk.toString();
    });

    request.on('end', async () => {
        const parsedBody = JSON.parse(body);
        const responseData = { message: 'Received data successfully! (POST)', data: parsedBody };
        /*
        * JS passes objects and arrays by reference. 
        * To mitigate, create deep copy of parsedBody as below.
        */
        const parsedBodyCopy = JSON.parse(JSON.stringify(parsedBody));

        // Add CREATOR_NAME to clubMembers in parsedBodyCopy
        parsedBodyCopy.clubMembers.push(CREATOR_NAME);
        const parsedBodyWithCreatorName = JSON.stringify(parsedBodyCopy, null, 2);

        try {
            await fs.writeFile('./club.json', parsedBodyWithCreatorName);
            response.writeHead(200, { 'Content-Type': 'application/json;  charset=utf-8' });
            response.end(JSON.stringify(responseData));
        } catch(err) {
            console.log('Error writing request body to JSON:', err);
            response.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
            response.end('Internal Server Error');
        }
    });
}

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});