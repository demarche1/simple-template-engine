import { readFile } from "fs/promises";
import fs from "fs";
import path from "path";
import { exit } from "process";

export default class View {
  #TEMPLATE_PATTERN;
  #SPECIAL_STRUCTURES_PATTERN;
  #code;

  constructor() {
    this.#TEMPLATE_PATTERN = /<&([^&>]+)?&>/g;
    this.#SPECIAL_STRUCTURES_PATTERN = /(^( )?(if|for|else|switch|case|break|{|}))(.*)?/g,
    this.#code = "var x=[];";
  }

  /**
   * Check if HTML file exists in views folder.
   *
   * @param {string} file
   * @return {Array<string, boolean>} 
   */
  fileExists(file) {
    const { pathname } = new URL(import.meta.url);
    const filePath = path.join(pathname, "..", "..", "views", file);
    const p = path.join(filePath, "/views", file);

    return [filePath, fs.existsSync(filePath)];
  }

  /**
   * Creates a code structure string to be used in the render function.
   * 
   * @example {
   *  if code is just HTML content, the structure will be: x.push("<h1>");
   *
   *  if code is a JavaScript variable, the structure will be: x.push(this.profile.age);
   *
   *  if code is a JavaScript structure, the structure will be: code += if(this.profile.age) {
   *
   * }
   * 
   * 
   * @param {string} line 
   * @param {boolean} js
   * @returns {string}
   */
  addToCode(line, js) {
    if(js) {
      if(this.#SPECIAL_STRUCTURES_PATTERN.test(line)) {
        return this.#code += line
      }
      return this.#code += 'x.push(' + line + ');'
    }
    return this.#code += 'x.push("' + line.replace(/"/g, '\\\\"') + '");';
  }

  /**
   * Get all content from a HTML file.
   *
   * @param {string} file 
   * @returns {string}
   */
  async getFileContent(file) {
    const data = await readFile(file, { encoding: "utf-8" });
    return data.trim();
  }

  /**
   * Render the HTML file with the data passed.
   *
   * @param {string} file 
   * @param {Object} data 
   * @returns 
   */
  async render(file, data) {
    const [filePath, exists] = this.fileExists(file);

    if (!exists) {
      throw new Error("File does not exist");
      return;
    }

    const content = await this.getFileContent(filePath);
    let cursorPosition = 0;
    let match;

    while ((match = this.#TEMPLATE_PATTERN.exec(content))) {
      this.addToCode(content.slice(cursorPosition, match.index).trim());
      this.addToCode(match[1].trim(), true);
      cursorPosition = match.index + match[0].length;
    }

    this.addToCode(content.substring(content.length, cursorPosition));
    this.#code += 'return x.join("");';

    return new Function(this.#code.replace(/[\\\n]/g, '')).apply(data)
  }
}
