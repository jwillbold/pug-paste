'use babel';

import PugPaste from '../lib/pug-paste';

// Use the command `window:run-package-specs` (cmd-alt-ctrl-p) to run specs.
//
// To run a specific `it` or `describe` block add an `f` to the front (e.g. `fit`
// or `fdescribe`). Remove the `f` to unfocus the block.

const htmlTestText = '\
<!doctype html>\n\
<html lang="en">\n\
  <head>\n\
    <title>Hello World!</title>\n\
  </head>\n\
  <body>\n\
    <div id="content">\n\
      <h1 class="title">Hello World!</h1>\n\
    </div>\n\
  </body>\n\
</html>';

const pugTestText = "\
doctype html\n\
html(lang='en')\n\
\thead\n\
\t\ttitle Hello World!\n\
\tbody\n\
\t\t#content\n\
\t\t\th1.title Hello World!";

const commandEnableClipbaordTransform = "pug-paste:enable-clipbaord-transform";
const commandDisableClipbaordTransform = "pug-paste:disable-clipbaord-transform";
const commandToggleClipbaordTransform = "pug-paste:toggle-clipbaord-transform";

describe('PugPaste', () => {
  let workspaceElement, activationPromise;

  beforeEach(() => {
    workspaceElement = atom.views.getView(atom.workspace);
    activationPromise = atom.packages.activatePackage('pug-paste');
  });

  let testHelper = (enableCommand, disableCommand) => {
    return () => {
      beforeEach(() => {
        atom.commands.dispatch(workspaceElement, enableCommand);
        atom.clipboard.write(htmlTestText);
      });

      afterEach(() => {
        atom.commands.dispatch(workspaceElement, disableCommand);
        expect(atom.clipboard.read()).toBe(htmlTestText);
      });

      let testHelper = (fileName, expectedOutput) => {
        return () => {
          waitsForPromise(() => atom.workspace.open(fileName));

          runs(() => {
            expect(atom.workspace.getActiveTextEditor().getPath()).toContain(fileName);
            expect(atom.clipboard.read()).toBe(expectedOutput);
          });
        }
      };

      it("paste html to test.html", testHelper('test.html', htmlTestText));
      it("paste html to test.pug", testHelper('test.pug', pugTestText));
      it("paste html to test.txt", testHelper('test.txt', htmlTestText));
    };
  };

  describe('pug-paste:enable/disable-clipbaord-transform',
            testHelper(commandEnableClipbaordTransform,
                       commandDisableClipbaordTransform));

  describe('pug-paste:toggle-clipbaord-transform',
            testHelper(commandToggleClipbaordTransform,
                       commandToggleClipbaordTransform));
});
