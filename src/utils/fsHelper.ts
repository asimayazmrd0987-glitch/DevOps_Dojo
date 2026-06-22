import { FileNode } from '../types';

/**
 * Traverses a virtual filesystem tree given a split path array
 */
export function getNodeByPath(
  root: { [key: string]: FileNode },
  pathParts: string[]
): FileNode | null {
  let current: { [key: string]: FileNode } | undefined = root;
  let targetNode: FileNode | null = null;

  if (pathParts.length === 0 || (pathParts.length === 1 && pathParts[0] === '')) {
    return { name: 'root', isDir: true, children: root };
  }

  for (let i = 0; i < pathParts.length; i++) {
    const part = pathParts[i];
    if (!part || part === '.') continue;
    if (!current || !current[part]) {
      return null;
    }
    const node = current[part];
    if (i === pathParts.length - 1) {
      targetNode = node;
    } else {
      if (!node.isDir) return null;
      current = node.children;
    }
  }

  return targetNode;
}

/**
 * Creates or overwrites a node along a given path
 */
export function setNodeByPath(
  root: { [key: string]: FileNode },
  pathParts: string[],
  newNode: FileNode
): { [key: string]: FileNode } {
  const result = JSON.parse(JSON.stringify(root)); // Deep clone
  let current = result;

  if (pathParts.length === 0 || (pathParts.length === 1 && pathParts[0] === '')) {
    return result;
  }

  for (let i = 0; i < pathParts.length; i++) {
    const part = pathParts[i];
    if (i === pathParts.length - 1) {
      current[part] = newNode;
    } else {
      if (!current[part]) {
        current[part] = { name: part, isDir: true, children: {} };
      } else if (!current[part].isDir) {
        // Overwrite file with directory if mid-path
        current[part] = { name: part, isDir: true, children: {} };
      }
      if (!current[part].children) {
        current[part].children = {};
      }
      current = current[part].children!;
    }
  }

  return result;
}

/**
 * Removes a file or directory node from a given path
 */
export function deleteNodeByPath(
  root: { [key: string]: FileNode },
  pathParts: string[]
): { [key: string]: FileNode } {
  const result = JSON.parse(JSON.stringify(root));
  let current = result;

  for (let i = 0; i < pathParts.length; i++) {
    const part = pathParts[i];
    if (i === pathParts.length - 1) {
      delete current[part];
    } else {
      if (!current[part] || !current[part].children) return root; // No-op if path doesn't exist
      current = current[part].children!;
    }
  }

  return result;
}

/**
 * Builds array of path parts for relative/absolute traversal
 */
export function resolvePath(currentPath: string, targetPath: string): string[] {
  let baseParts = currentPath.split('/').filter(Boolean);
  
  if (targetPath.startsWith('/')) {
    baseParts = []; // Absolute path
  }

  const targetParts = targetPath.split('/').filter(Boolean);

  for (const part of targetParts) {
    if (part === '.') {
      continue;
    } else if (part === '..') {
      baseParts.pop();
    } else {
      baseParts.push(part);
    }
  }

  return baseParts;
}

/**
 * Flattens file names into string paths for quick debug/checking
 */
export function getFlatFileList(
  root: { [key: string]: FileNode },
  prefix = ''
): { path: string; isDir: boolean; content?: string }[] {
  const result: { path: string; isDir: boolean; content?: string }[] = [];

  for (const name of Object.keys(root)) {
    const node = root[name];
    const currentPath = prefix ? `${prefix}/${name}` : name;
    result.push({ path: currentPath, isDir: node.isDir, content: node.content });
    if (node.isDir && node.children) {
      result.push(...getFlatFileList(node.children, currentPath));
    }
  }

  return result;
}
