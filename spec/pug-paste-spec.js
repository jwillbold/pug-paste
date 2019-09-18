'use babel';

import PugPaste from '../lib/pug-paste';

// Use the command `window:run-package-specs` (cmd-alt-ctrl-p) to run specs.
//
// To run a specific `it` or `describe` block add an `f` to the front (e.g. `fit`
// or `fdescribe`). Remove the `f` to unfocus the block.

const regularText = '\
Some regular text\n\
With multiple lines\n';

// Currenlty head, body and html tags are ignored. Keep these two for later.
// const htmlText = '\
// <!doctype html>\n\
// <html lang="en">\n\
// \t<head>\n\
// \t\t<title>An HTML site</title>\n\
// \t</head>\n\
// \t<body>\n\
// \t\t<div class="container">\n\
// \t\t\t<h1 id="title">Hello World!</h1>\n\
// \t\t</div>\n\
// \t</body>\n\
// </html>';

// const pugText = "\
// doctype html\n\
// html(lang='en')\n\
// \thead\n\
// \t\ttitle An HTML site\n\
// \tbody\n\
// \t\t.container\n\
// \t\t\th1#title Hello World!";

const htmlFragmentText ='\
<div class="container">\n\
\t<ul class="nav">\n\
\t\t<li class="nav-item active"><a href="?lang=en"><i>EN</i></a></li>\n\
\t</ul>\n\
\t<h1 id="title"> Hello World</h1>\n\
\t<p> Welcome to my site </p>\n\
</div>';

const pugFragmentText = "\
.container\n\
\tul.nav\n\
\t\tli.nav-item.active\n\
\t\t\ta(href='?lang=en')\n\
\t\t\t\ti EN\n\
\th1#title Hello World\n\
\tp Welcome to my site";

const commandEnableclipboardTransform = "pug-paste:enable-clipboard-transform";
const commandDisableclipboardTransform = "pug-paste:disable-clipboard-transform";
const commandToggleclipboardTransform = "pug-paste:toggle-clipboard-transform";

describe('PugPaste', () => {
  let workspaceElement, activationPromise;

  beforeEach(() => {
    workspaceElement = atom.views.getView(atom.workspace);
    activationPromise = atom.packages.activatePackage('pug-paste');
  });

  let testHelper = (enableCommand, disableCommand) => {
    return () => {

      let testHelper = (fileName, input, expectedOutput) => {
        return () => {
          atom.commands.dispatch(workspaceElement, enableCommand);

          atom.clipboard.write(input);

          waitsForPromise(() => atom.workspace.open(fileName));

          runs(() => {
            expect(atom.workspace.getActiveTextEditor().getPath()).toContain(fileName);
            expect(atom.clipboard.read()).toBe(expectedOutput);

            atom.commands.dispatch(workspaceElement, disableCommand);

            expect(atom.clipboard.read()).toBe(input);
          });
        }
      };

      it("paste html to test.html", testHelper('test.html', htmlFragmentText, htmlFragmentText));
      it("paste html to test.pug", testHelper('test.pug', htmlFragmentText, pugFragmentText));
      it("paste html to test.txt", testHelper('test.txt', htmlFragmentText, htmlFragmentText));

      it("paste text to test.pug", testHelper('test.pug', regularText, regularText));
      it("paste pug to test.pug", testHelper('test.pug', pugFragmentText, pugFragmentText));
    };
  };

  describe('pug-paste:enable/disable-clipboard-transform',
            testHelper(commandEnableclipboardTransform,
                       commandDisableclipboardTransform));

  describe('pug-paste:toggle-clipboard-transform',
            testHelper(commandToggleclipboardTransform,
                       commandToggleclipboardTransform));
});
