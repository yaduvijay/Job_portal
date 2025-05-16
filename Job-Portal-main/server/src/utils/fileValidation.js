const fileParamsConfig = {
  logo: { ext: "png", size: "400x100", filesize: "150KB" },
  icons: { ext: "png", size: "64x64", filesize: "50KB" },
  avatar: { ext: "png", size: "400x400", filesize: "300KB" },
  blog: { ext: "webp", size: "1200x800", filesize: "400KB" },
  image: { ext: "jpeg", size: "2000x2000", filesize: "700KB" },
  wallpaper: { ext: "jpeg", size: "1920x1080", filesize: "1.5MB" },
  linkedIn: { ext: "jpeg", size: "1584x396", filesize: "1MB" },
};

function getFormattedLocalTime(file) {
  const localTime = new Date();

  const year = localTime.getFullYear();
  const month = String(localTime.getMonth() + 1).padStart(2, "0");
  const day = String(localTime.getDate()).padStart(2, "0");
  const hours = String(localTime.getHours()).padStart(2, "0");
  const minutes = String(localTime.getMinutes()).padStart(2, "0");
  const seconds = String(localTime.getSeconds()).padStart(2, "0");

  return `${year}-${month}-${day}-${hours}${minutes}${seconds}-${file.fieldname}`;
}

const addQuery = (file) => {
  const fileData = fileParamsConfig[file.fieldname] || {};
  file.originalname = `${file.originalname}?ext=${fileData.ext || ""}&size=${
    fileData.size || ""
  }&filesize=${fileData.filesize || ""}`;
};

export const fileValidation = (req, res) => {
  const maxSize = 10 * 1024 * 1024; // 10MB

  const files = req.files || {};
  Object.values(files)
    .flat()
    .forEach((file) => {
      if (file.size > maxSize) {
        return res.status(400).json({ message: "File size exceeds 10MB" });
      }

      const extname = file.originalname.split(".").pop().toLowerCase();
      const newFileName = `${getFormattedLocalTime(file)}.${extname}`;
      file.originalname = newFileName;
      if (!["pdf", "doc", "docx"].includes(extname)) {
        addQuery(file);
      }
    });
};
