import { visit } from "unist-util-visit";
import type { Root } from "mdast";

/**
 * Remark plugin that rewrites image paths starting with "public/" to "/".
 * Obsidian stores attachments in public/attachments/ but Astro serves
 * the public directory at the site root.
 */
export default function remarkPublicImages() {
  return (tree: Root) => {
    visit(tree, "image", (node) => {
      if (node.url.startsWith("public/")) {
        node.url = node.url.replace(/^public\//, "/");
      }
    });
  };
}
