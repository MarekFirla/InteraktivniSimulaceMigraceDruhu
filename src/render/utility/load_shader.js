export async function loadShader(path) {
    const res = await fetch(path);
    if (!res.ok) {
        throw new Error(`Failed to load shader: ${path}`);
    }
    return await res.text();
}
