const s3Client = require("../../config/config-aws");
const { PutObjectCommand } = require("@aws-sdk/client-s3");

const uploadFilesToS3 = async (files) => {
  try {
    // Initialize an empty object to group URLs by propertyId
    const urlsByPropertyId = {};
    const idNameMap = new Map();

    // Iterate over the files and upload them to S3
    const uploadPromises = files.map(async (file) => {
      const [internalPropertyName, propertyId, fileName, uuid] =
        file.fieldname.split("-");
      idNameMap.set(propertyId, internalPropertyName);
      const params = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: file.fieldname,
        Body: file.buffer,
      };

      await s3Client.send(new PutObjectCommand(params));

      // Initialize array for propertyId if it doesn't exist
      if (!urlsByPropertyId[propertyId]) {
        urlsByPropertyId[propertyId] = [];
      }

      // Append the URL to the respective propertyId array
      urlsByPropertyId[propertyId].push(
        `https://${params.Bucket}.s3.amazonaws.com/${params.Key}`
      );
    });

    await Promise.all(uploadPromises);

    // Transform urlsByPropertyId to use internalPropertyNames as keys
    const urlsByInternalPropertyName = {};
    for (const [propertyId, urls] of Object.entries(urlsByPropertyId)) {
      const internalPropertyName = idNameMap.get(propertyId);
      urlsByInternalPropertyName[internalPropertyName] = urls;
    }
    console.log(urlsByInternalPropertyName, "urlsByInternalPropertyName");

    return urlsByInternalPropertyName;
  } catch (error) {
    console.error("Error uploading files to S3:", error);
    throw error;
  }
};

module.exports = uploadFilesToS3;
