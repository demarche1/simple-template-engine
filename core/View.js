import { readFile } from "fs/promises";
import fs from "fs";
import path from "path";
import { exit } from "process";

export default class View {
  #TEMPLATE_PATTERN;
  #SPECIAL_STRUCTURES_PATTERN;
  #code;
  #cursorPosition;

  constructor() {
    this.#TEMPLATE_PATTERN = /<&([^&>]+)?&>/g;
    this.#SPECIAL_STRUCTURES_PATTERN = /(^( )?(if|for|else|switch|case|break|{|}))(.*)?/g,
    this.#code = "var x=[];";
    this.#cursorPosition = 0;
  }

  fileExists(file) {
    const { pathname } = new URL(import.meta.url);
    const filePath = path.join(pathname, "..", "..", "views", file);
    const p = path.join(filePath, "/views", file);

    return [filePath, fs.existsSync(filePath)];
  }

  addToCode(line, js) {
    if(js) {
      if(line.match(this.#SPECIAL_STRUCTURES_PATTERN)) {
        return this.#code += line
      } else {
        return this.#code += 'x.push(' + line + ');'
      }

      return this.#code += 'x.push(' + line + ');';
    }

    this.#code += 'x.push("' + line.replace(/"/g, '\\\\"') + '");';
  }

  async getFileContent(file) {
    const data = await readFile(file, { encoding: "utf-8" });
    return data.trim();
  }

  async render(file, data) {
    const [filePath, exists] = this.fileExists(file);

    if (!exists) {
      throw new Error("File does not exist");
      return;
    }

    const content = await this.getFileContent(filePath);

    var match;
    while ((match = this.#TEMPLATE_PATTERN.exec(content))) {
      this.addToCode(content.slice(this.#cursorPosition, match.index).trim());
      this.addToCode(match[1].trim(), true);
      this.#cursorPosition = match.index + match[0].length;
    }

    this.addToCode(content.substring(content.length, this.#cursorPosition));
    this.#code += 'return x.join("");';

    return new Function(this.#code.replace(/[\\\n]/g, '')).apply(data)
  }
}
