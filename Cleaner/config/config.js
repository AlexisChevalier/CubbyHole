var configArray = null;

module.exports = (function () {
    if (configArray == null) {
        try {
            console.log("Checking global configuration file...");
            require.resolve("../../globalConf.json");
            configArray = require("../../globalConf.json");
            return configArray;
        } catch(e) {
            console.log("Can't find global configuration file. Exiting...");
            return process.exit(1);
        }
    }
    return configArray;
}());
