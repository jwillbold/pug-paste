'use babel';

import { CompositeDisposable } from 'atom';

const html2pug = require('html2pug');

export default {
  subscriptions: null,
  originalAtomClipboardReadFunc: null,
  transformationOptions: { tabs: true, fragment: true },

  config: {
    pugFileMatcherRegex: {
      type: 'string',
      default: '.*\\.pug$',
      description: 'The regex used to identify pug files.'
    },
    htmlCodeMatcherRegex: {
      type: 'string',
      default: '\\<\\/?(\\w+)\\s*(\\w+\\s*=\\s*(\\\".*\\\"|\\\'.*\\\')?\\"?\\s*)*\\/?\\>',
      description: 'The regex used to identify HTML code. Only code matched by this regex, will be converted to PUG.'
    }
  },

  activate(state) {
    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable();

    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'pug-paste:paste-html2pug': () => this.pasteHtml2Pug()
    }));

    // clipboard auto transformations
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'pug-paste:enable-clipboard-transform': () => this.enableclipboardTransform(),
      'pug-paste:disable-clipboard-transform': () => this.disableclipboardTransform(),
      'pug-paste:toggle-clipboard-transform': () => this.toogleclipboardTransform()
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

  enableclipboardTransform() {
    if(this.originalAtomClipboardReadFunc !== null) {
      return ; // Already enabled
    }

    this.originalAtomClipboardReadFunc = atom.clipboard.read;

    atom.clipboard.read = (self) => {
      let clipboardContent = this.originalAtomClipboardReadFunc.apply(self);

      try {
        let editor = this.activeTextEditor();

        if(this.isPugFile(editor.getTitle()) && this.isHtmlCode(clipboardContent)) {
          try {
            let pug = html2pug(clipboardContent, this.transformationOptions);
            return pug;
          } catch(e) {
            atom.notifications.addWarning(e.reason)
            return clipboardContent;
          }
        }
      } catch(e) {
        atom.notifications.addWarning(e.reason)
        return clipboardContent;
      }

      return clipboardContent;
    }
  },

  disableclipboardTransform() {
    if(this.originalAtomClipboardReadFunc !== null) {
      atom.clipboard.read = this.originalAtomClipboardReadFunc;
      this.originalAtomClipboardReadFunc = null;
    }
  },

  toogleclipboardTransform() {
    if(this.isClipboardTransformActive()) {
      this.disableclipboardTransform();
    } else {
      this.enableclipboardTransform();
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
    let htmlMatcher = new RegExp(atom.config.get('pug-paste.htmlCodeMatcherRegex'), 'g');
    return text.match(htmlMatcher) != null;
  },

  isClipboardTransformActive() {
    return this.originalAtomClipboardReadFunc !== null;
  }
};
