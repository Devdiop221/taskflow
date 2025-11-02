const fs = require("fs");
const path = require("path");

// Import the swagger configuration
const { swaggerSpec } = require("../dist/config/swagger");

// Generate the OpenAPI spec file
const outputPath = path.join(__dirname, "../docs/openapi.json");
const docsDir = path.dirname(outputPath);

// Create docs directory if it doesn't exist
if (!fs.existsSync(docsDir)) {
  fs.mkdirSync(docsDir, { recursive: true });
}

// Write the spec to file
fs.writeFileSync(outputPath, JSON.stringify(swaggerSpec, null, 2));

console.log("✅ OpenAPI documentation generated at:", outputPath);
console.log(
  "📖 To view the interactive documentation, start the server and go to http://localhost:5000/api-docs"
);
