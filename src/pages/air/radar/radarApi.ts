export async function fetchRadarJson<T>(input: RequestInfo | URL): Promise<T> {
  const response = await fetch(input);

  if (!response.ok) {
    throw new Error(`Radar INEA request failed: ${response.status}`);
  }

  return response.json() as Promise<T>;
}
