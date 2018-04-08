const http = require('http');
const fs = require('fs');

const publicPath = './public';
const indexPath = '/index.html';

const server = http.createServer((request, response) => {
	const filePath = (request.url === '/') ? publicPath + indexPath : publicPath + request.url;

	fs.readFile(filePath, (error, file) => {
		if (error) {
			response.writeHead(404);
			response.write('Page not found', filePath);
 		} else {
 			response.writeHead(200);
 			response.write(file);
 		}
 		response.end();
	});
});

server.listen('8081', () => {
	console.log('Server is running on port 8081');
});