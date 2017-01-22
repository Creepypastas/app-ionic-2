function handleOpenURL(url) {
  console.debug("requested url: " + url);
  localStorage.setItem('requestedUrl', url);
}
