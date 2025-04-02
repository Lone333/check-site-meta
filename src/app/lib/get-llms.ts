import { cache } from "react";
import { appFetch } from "./fetch";

export const getLLMsStream = cache(async function getLLMs(url: string) {
  const res = await appFetch(new URL('/llms.txt', url).toString(), {
    cache: 'no-store',
    headers: { Connection: 'keep-alive', Accept: 'text/plain' }
  })
  if (!res.body) {
    console.error("No response body received!");
    return null;
  }

  const reader = res.body.getReader();

  return new ReadableStream({
    start(controller) {
      function push() {
        reader.read().then(({ done, value }) => {
          if (done) {
            controller.close();
            return;
          }
          controller.enqueue(value);
          push();
        }).catch(error => {
          controller.error(error);
        });
      }
      push();
    },
    cancel() {
      reader.cancel();
    }
  });
})


// function stringToArrayBuffer(str: string) {
//   const encoder = new TextEncoder();
//   return encoder.encode(str).buffer;
// }

// const buffer = stringToArrayBuffer("Hello, world!");