const fs = require("fs")
const packageJson = require("../package.json")

const manifestPath = "./build/manifest.json"

// "browser_specific_settings": {
//   "gecko": {
//     "id": "warrenjday@graphqlnetworkinspector.com"
//   }
// }

fs.readFile(manifestPath, "utf-8", (err, json) => {
  const manifest = JSON.parse(json)
  manifest.version = packageJson.version
  fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2), () => {})
})
