/**
* Since chrome 73 there is problem accessing application/json content from cross origin - our signalr request gets blocked by CORB.
* Solved by adding access-control-allow-origin:* for requests to the Weavy server.
* See: https://bugs.chromium.org/p/chromium/issues/detail?id=933893, https://www.chromestatus.com/feature/5629709824032768, https://stackoverflow.com/questions/54786635/how-to-avoid-cross-origin-read-blockingcorb-in-a-chrome-web-extension
*/
chrome.webRequest.onHeadersReceived.addListener(details => {
    var wUrl = "https://twentyfouronoff.weavycloud.com/";
   // var wUrl = "https://localhost:44323/";

    var headers = details.responseHeaders;
    if (wUrl !== null && (details.url.startsWith(wUrl))) {
        headers = headers.filter(item => item.name.toLowerCase() !== "access-control-allow-origin");
        headers.push({ name: "Access-Control-Allow-Origin", value: "*" });
    }

    return { responseHeaders: headers };
}, { urls: ["<all_urls>"] }, ["blocking", "extraHeaders", "responseHeaders"]);

