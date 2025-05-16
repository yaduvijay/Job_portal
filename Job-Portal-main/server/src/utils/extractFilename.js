export const extractFilename = (url) => {
  // Use a regular expression to match the filename
  const regex = /[^/]+$/;
  const match = url.match(regex);
  return match ? match[0] : null;
};
