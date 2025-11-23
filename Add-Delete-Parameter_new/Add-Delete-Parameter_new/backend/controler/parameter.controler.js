const fs = require("fs");
const path = require("path");

const rootDir = require("../utils/pathUtil");
const parametersFilePath = path.join(rootDir, "data", "Parameters.json");

const Parameter = require("../models/Parameter");
const getParameters = async (req, res) => {
  try {
    const parameters = await Parameter.find();
    res.json(parameters);
  } catch (err) {
    res.status(500).json({ error: "Error fetching parameters" });
  }
};

exports.getParameters = getParameters;

const createParameter = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name || name.trim() === "") {
      return res.status(400).json({ error: "Parameter name is required" });
    }

    // Case-insensitive duplicate check
    const existingParameter = await Parameter.findOne({
      name: new RegExp(`^${name}$`, "i"),
    });

    if (existingParameter) {
      return res.status(400).json({ error: "Parameter already exists" });
    }

    const newParameter = new Parameter({ name });
    await newParameter.save();

    // Update Parameters.json
    // await updateParametersFile();

    res.status(201).json(newParameter);
  } catch (err) {
    res.status(500).json({ error: "Error adding parameter" });
  }
};

exports.createParameter = createParameter;

const deleteParameter = async (req, res) => {
  try {
    const { ids } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return res
        .status(400)
        .json({ error: "At least one parameter ID is required" });
    }

    await Parameter.deleteMany({ _id: { $in: ids } });

    // Update Parameters.json
    await updateParametersFile();

    res.status(200).json({ message: "Parameters deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Error deleting parameters" });
  }
};

exports.deleteParameter = deleteParameter;

const updateParametersFile = async () => {
  try {
    const parameters = await Parameter.find();
    fs.writeFileSync(
      parametersFilePath,
      JSON.stringify(parameters, null, 2),
      "utf8"
    );
    console.log("✅ Parameters.json updated successfully!");
  } catch (error) {
    console.error("❌ Error updating Parameters.json:", error);
  }
};

const syncParametersFromFile = async () => {
  try {
    if (!fs.existsSync(parametersFilePath)) {
      console.log("❗ Parameters.json does not exist. Skipping sync.");
      return;
    }

    const fileData = fs.readFileSync(parametersFilePath, "utf8");
    const parametersFromFile = JSON.parse(fileData);

    // Fetch all parameters from the database
    const parametersInDB = await Parameter.find();

    // Convert arrays to objects for easier comparison
    const parametersFileMap = new Map(
      parametersFromFile.map((param) => [param._id, param])
    );
    const parametersDBMap = new Map(
      parametersInDB.map((param) => [param._id.toString(), param])
    );

    for (const param of parametersFromFile) {
      const existingParameter = await Parameter.findOne({ _id: param._id });

      if (!existingParameter) {
        const newParameter = new Parameter(param);
        await newParameter.save();
        console.log(`🔄 Synced new parameter: ${param.name}`);
      }
    }

    // Delete parameters from the database if they were removed from the file
    for (const param of parametersInDB) {
      if (!parametersFileMap.has(param._id.toString())) {
        await Parameter.deleteOne({ _id: param._id });
        console.log(`🗑️ Deleted parameter from DB: ${param.name}`);
      }
    }

    console.log("✅ Sync completed successfully!");
  } catch (error) {
    console.error("❌ Error syncing parameters from file:", error);
  }
};

// Watch for changes in Parameters.json and sync automatically
fs.watchFile(parametersFilePath, async () => {
  console.log("📂 Detected change in Parameters.json. Syncing...");
  await syncParametersFromFile();
});

exports.syncParametersFromFile = syncParametersFromFile;
