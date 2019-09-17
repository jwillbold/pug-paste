'use babel';

import { CompositeDisposable } from 'atom';

const html2pug = require('html2pug');

export default {
  subscriptions: null,
  originalAtomClipboardReadFunc: null,
  transformationOptions: { tabs: true },

  config: {
    pugFileMatcherRegex: {
      type: 'string',
      default: '.*\\.pug$',
      description: 'The regex used to identify pug files.'
    }
  },

  activate(state) {
    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable();

    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'pug-paste:paste-html2pug': () => this.pasteHtml2Pug()
    }));

    // Clipbaord auto transformations
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'pug-paste:enable-clipbaord-transform': () => this.enableClipbaordTransform(),
      'pug-paste:disable-clipbaord-transform': () => this.disableClipbaordTransform(),
      'pug-paste:toggle-clipbaord-transform': () => this.toogleClipbaordTransform()
    }));

  },

  deactivate() {
    this.subscriptions.dispose();
  },

  serialize() {
    return {
    };
  },

  pasteHtml2Pug() {
    try {
      let html = this.readOriginalClipboard();
      let editor = this.activeTextEditor();
      let pug = html2pug(html, this.transformationOptions);
      editor.insertText(pug);
    } catch(e) {
      atom.notifications.addWarning(e.reason)
    }
  },

  enableClipbaordTransform() {
    if(this.originalAtomClipboardReadFunc !== null) {
      return ; // Already enabled
    }

    this.originalAtomClipboardReadFunc = atom.clipboard.read;

    atom.clipboard.read = (self) => {
      let clipbaordContent = this.originalAtomClipboardReadFunc.apply(self);

      try {
        let editor = this.activeTextEditor();

        if(this.isPugFile(editor.getTitle()) && this.isHtmlCode(clipbaordContent)) {
          try {
            let pug = html2pug(clipbaordContent, this.transformationOptions);
            return pug;
          } catch(e) {
            atom.notifications.addWarning(e.reason)
            return clipbaordContent;
          }
        }
      } catch(e) {
        atom.notifications.addWarning(e.reason)
        return clipbaordContent;
      }

      return clipbaordContent;
    }
  },

  disableClipbaordTransform() {
    if(this.originalAtomClipboardReadFunc !== null) {
      atom.clipboard.read = this.originalAtomClipboardReadFunc;
      this.originalAtomClipboardReadFunc = null;
    }
  },

  toogleClipbaordTransform() {
    if(this.isClipbaordTransformActive()) {
      this.disableClipbaordTransform();
    } else {
      this.enableClipbaordTransform();
    }
  },

  readOriginalClipboard() {
    if(this.originalAtomClipboardReadFunc !== null) {
      return this.originalAtomClipboardReadFunc.apply(atom.clipboard)
    }

    return atom.clipboard.read();
  },

  activeTextEditor() {
    return atom.workspace.getActiveTextEditor();
  },

  isPugFile(fileName) {
    let pugFileMatcher = new RegExp(atom.config.get('pug-paste.pugFileMatcherRegex'));
    return pugFileMatcher.test(fileName);
  },

  isHtmlCode(text) {
    return true;
  },

  isClipbaordTransformActive() {
    return this.originalAtomClipboardReadFunc !== null;
  }
};
