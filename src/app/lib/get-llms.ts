import { unified } from "unified";
import { AppError } from "../module/error/error-primitives";
import { appFetch, getUTF8Text } from "./fetch";
import remarkParse from "remark-parse";
import type { Root, RootContent } from "mdast";
import type { PreviewMessages } from "../components/previews/Preview";

export async function getLLMtext(url: string) {
  const res = await appFetch(url)
  const text = await getUTF8Text(res)
  const byteSize = new TextEncoder().encode(text).length
  try {
    const contextLength = await appFetch('https://util.alfon.dev/api/tiktoken/tokenize-all', {
      method: 'POST',
      body: JSON.stringify({ content: text })
    })
    const json = await contextLength.json() as
      | {
        data: {
          [encoding: string]:
          | { token: number[] }
          | { error: string }
        }, remaining: number
      }
      | { error: string }
      | { error: string, remaining: number, reset: number }


    if ('error' in json) {
      throw new AppError('getLLMtext', 'Failed to get context length', json.error, ['util.alfon.dev returned error'])
    }

    const contextLengths = Object.entries(json.data).map(([encoding, data]) => {
      return {
        encoding,
        contextLength: 'error' in data ? -1 : Object.keys(data.token).length,
      }
    })


    const validated = validateLlmsTxt(text)

    return {
      text,
      byteSize,
      contextLengths,

      validated,

      // rate-limit
      remaining: json.remaining,
      reset: 'reset' in json ? json.reset : undefined,
    }

  } catch (error) {
    throw new AppError('getLLMtext', 'Failed to get context length', undefined, undefined, error)
  }
}

function validateLlmsTxt(llms: string) {

  const messages: PreviewMessages = []

  

  const tree = unified()
    .use(remarkParse)
    .parse(llms) as Root

  // console.log(tree)
  
  function walk(node: Root | RootContent, depth = 0) {
    const indent = '  '.repeat(depth);

    if (node.type === "link") {
      
    }
    // console.log({
    //   ...node,
    //   children: `children` in node ? node.children.length : 0,
    //   position: undefined,
    // })


    // const summary = node.type + (node.value ? `: "${ node.value }"` : '');
    // console.log(`${ indent }- ${ node.type + ('value' in node ? `: "${node.value}"` : '') }`);

    if ('children' in node) {
      for (const child of node.children) {
        walk(child, depth + 1);
      }
    }
  }

  walk(tree);

  return {
    tree,
    messages,
  }
}



// export const getLLMsStream = cache(async function getLLMs(url: string) {
//   const res = await appFetch(new URL('/llms.txt', url).toString(), {
//     cache: 'no-store',
//     headers: { Connection: 'keep-alive', Accept: 'text/plain' }
//   })
//   if (!res.body) {
//     console.error("No response body received!");
//     return null;
//   }

//   const reader = res.body.getReader();

//   return new ReadableStream({
//     start(controller) {
//       function push() {
//         reader.read().then(({ done, value }) => {
//           if (done) {
//             controller.close();
//             return;
//           }
//           controller.enqueue(value);
//           push();
//         }).catch(error => {
//           controller.error(error);
//         });
//       }
//       push();
//     },
//     cancel() {
//       reader.cancel();
//     }
//   });
// })


// function stringToArrayBuffer(str: string) {
//   const encoder = new TextEncoder();
//   return encoder.encode(str).buffer;
// }

// const buffer = stringToArrayBuffer("Hello, world!");