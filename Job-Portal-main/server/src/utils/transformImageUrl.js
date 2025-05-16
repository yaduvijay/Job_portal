export const transformImageUrl = (url) => {
  const queryParams = url.split("?")[1];
  const extMatch = queryParams ? queryParams.match(/(?:^|&)ext=([^&]*)/) : null;
  const ext = extMatch ? extMatch[1] : null;
  const urlWithoutQuery = url.split("?")[0];
  const transformedUrl = urlWithoutQuery.replace(/\.[^/.]+$/, `.${ext}`);

  return transformedUrl;
};
