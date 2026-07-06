export async function calculateSHA256(data, base = 16) {
  const bytes = typeof data === 'string' ? new TextEncoder().encode(data) : data;
  const hashBuffer = await crypto.subtle.digest('SHA-256', bytes);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map((b) => b.toString(base).padStart(2, '0')).join('');
  return hashHex;
}

export async function compareHashes(dataA, dataB) {
  const [hashA, hashB] = await Promise.all([calculateSHA256(dataA), calculateSHA256(dataB)]);
  return { hashA, hashB, identical: hashA === hashB };
}
