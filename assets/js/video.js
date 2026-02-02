function stopAllVideos(container) {
  const iframes = container.querySelectorAll("iframe");

  iframes.forEach(iframe => {
    const src = iframe.src;
    iframe.src = "";
    iframe.src = src;
  });
}