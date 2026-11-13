import data from "./data/index.js";
import visualizers from "./visualizers/index.js";
import properties from "./properties/index.js";
import utils from "./utils/index.js";

// External libraries
import '../node_modules/bootstrap/dist/css/bootstrap.min.css';
import '../node_modules/font-awesome/css/font-awesome.min.css';

// Take version from package.json to avoid duplication
import packageJson from "../package.json" with { type: "json" };
const { version } = packageJson;

export {
    version,
    data,
    visualizers,
    properties,
    utils,
};