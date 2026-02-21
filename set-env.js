const fs = require('fs');
const path = require('path');

const dir = './src/environments';
if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
}

const content = `export const environment = {
  production: true,
  lambdaUrl: '${process.env.LAMBDA_URL || 'https://vjloab494k.execute-api.us-east-1.amazonaws.com/default/Encrypt'}'
};
`;

fs.writeFileSync(path.join(dir, 'environment.ts'), content);
fs.writeFileSync(path.join(dir, 'environment.prod.ts'), content);

console.log('Environment files generated successfully.');
