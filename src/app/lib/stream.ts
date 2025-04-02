export function processTextStream(stream: ReadableStream | null | undefined, onRead: (value: string) => void) {
  if (!stream) return
  const reader = stream.getReader();
  const decoder = new TextDecoder();
  while (true) {
    reader.read().then(
      ({ done, value }) => {
        if (done) {
          return;
        }
        const decoded = decoder.decode(value, { stream: true });
        onRead(decoded);
      }
    );
  }
}