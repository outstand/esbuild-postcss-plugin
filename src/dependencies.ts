import { Message } from "postcss";

export class Dependencies {
  files = new Set<string>();
  dirs = new Set<string>();

  addFile(file: string) {
    this.files.add(file);
  }

  addDir(dir: string) {
    this.dirs.add(dir);
  }

  getFiles(): string[] {
    return Array.from(this.files);
  }

  getDirs(): string[] {
    return Array.from(this.dirs);
  }

  processMessages(messages: Message[]) {
    for (const message of messages) {
      switch (message.type) {
        case "dependency":
          this.addFile(message.file);
        break;
        case "dir-dependency":
          this.addDir(message.dir);
        break;
      }
    }
  }
}
