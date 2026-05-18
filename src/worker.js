export default {
  async fetch(request) {
    const GAS_URL = "https://script.google.com/macros/s/AKfycbxpTUDlJFZpt0MxwnOuB97XaHJr0OOsqZAdU8Iclqm-5unIUaOLmtpOnaaY91jq5YN-/exec";

    const url = new URL(request.url);

    const ICON_URL = "https://cdn.jsdelivr.net/npm/emoji-datasource-apple/img/apple/64/1f371.png";

    return new Response(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Lunch Order</title>
        <meta name="viewport" content="width=375, initial-scale=1, viewport-fit=cover">
        <link rel="icon" href="${ICON_URL}" type="image/svg+xml">
        <link rel="apple-touch-icon" href="${ICON_URL}">
        <meta name="apple-mobile-web-app-capable" content="yes">
        <meta name="apple-mobile-web-app-title" content="Lunch Order">
        <meta name="apple-mobile-web-app-status-bar-style" content="default">
        <style>
          * { margin: 0; padding: 0; }
          body { overflow: hidden; }
          iframe {
            width: 100vw;
            border: none;
            height: 100vh;
            height: 100dvh;
          }
        </style>
      </head>
      <body>
        <iframe src="${GAS_URL}"></iframe>
      </body>
      </html>
    `, {
      headers: { 'Content-Type': 'text/html' },
    });
  }
}
