import * as assert from 'assert';
import * as sinon from 'sinon';
import { CompareFoldersProvider } from '../../providers/foldersCompareProvider';
import { ViewOnlyProvider } from '../../providers/viewOnlyProvider';
import { selectionContext } from '../../context/selection';
import { pathContext } from '../../context/path';
import { File } from '../../models/file';
import { TreeItemCollapsibleState, Uri, ExtensionContext } from 'vscode';
import * as comparer from '../../services/comparer';
import { globalState } from '../../services/globalState';

suite('compareWithSelected', () => {
  let provider: CompareFoldersProvider;
  let showDiffsStub: sinon.SinonStub;

  setup(() => {
    globalState.init({
      extension: { packageJSON: { version: '0.30.0' } },
      globalState: {
        get: () => [],
        update: () => Promise.resolve(),
      },
    } as unknown as ExtensionContext);
    selectionContext.clear();
    const onlyInA = new ViewOnlyProvider();
    const onlyInB = new ViewOnlyProvider();
    const identicals = new ViewOnlyProvider(false);
    provider = new CompareFoldersProvider(onlyInA, onlyInB, identicals);
    showDiffsStub = sinon.stub(comparer, 'showDiffs').resolves();
  });

  teardown(() => {
    sinon.restore();
    selectionContext.clear();
  });

  test('does nothing if no file is selected in selectionContext', async () => {
    const fileB = new File({
      label: 'fileB.txt',
      type: 'file',
      collapsibleState: TreeItemCollapsibleState.None,
      resourceUri: Uri.file('/folderB/fileB.txt'),
    });

    await provider.compareWithSelected(fileB);
    assert.strictEqual(showDiffsStub.called, false);
  });

  test('does nothing if selected file and target file are the same', async () => {
    const fileA = new File({
      label: 'fileA.txt',
      type: 'file',
      collapsibleState: TreeItemCollapsibleState.None,
      resourceUri: Uri.file('/folderA/fileA.txt'),
    });

    selectionContext.setSelectedFile(fileA, 'onlyA');
    await provider.compareWithSelected(fileA);
    assert.strictEqual(showDiffsStub.called, false);
  });

  test('compares file selected in folder 1 with file hovered in folder 2', async () => {
    pathContext.setPaths('/folderA', '/folderB');

    const fileA = new File({
      label: '_rename_me_first.txt',
      type: 'file',
      collapsibleState: TreeItemCollapsibleState.None,
      resourceUri: Uri.file('/folderA/_rename_me_first.txt'),
    });

    const fileB = new File({
      label: 'renamed.txt',
      type: 'file',
      collapsibleState: TreeItemCollapsibleState.None,
      resourceUri: Uri.file('/folderB/renamed.txt'),
    });

    selectionContext.setSelectedFile(fileA, 'onlyA');
    await provider.compareWithSelected(fileB);

    assert.strictEqual(showDiffsStub.calledOnce, true);
    const args = showDiffsStub.firstCall.args;
    assert.deepStrictEqual(args[0], ['/folderA/_rename_me_first.txt', '/folderB/renamed.txt']);
    assert.strictEqual(args[1], '_rename_me_first.txt ↔ renamed.txt');
  });

  test('correctly orders left/right paths if file selected in folder 2 and target in folder 1', async () => {
    pathContext.setPaths('/folderA', '/folderB');

    const fileA = new File({
      label: '_rename_me_first.txt',
      type: 'file',
      collapsibleState: TreeItemCollapsibleState.None,
      resourceUri: Uri.file('/folderA/_rename_me_first.txt'),
    });

    const fileB = new File({
      label: 'renamed.txt',
      type: 'file',
      collapsibleState: TreeItemCollapsibleState.None,
      resourceUri: Uri.file('/folderB/renamed.txt'),
    });

    selectionContext.setSelectedFile(fileB, 'onlyB');
    await provider.compareWithSelected(fileA);

    assert.strictEqual(showDiffsStub.calledOnce, true);
    const args = showDiffsStub.firstCall.args;
    assert.deepStrictEqual(args[0], ['/folderA/_rename_me_first.txt', '/folderB/renamed.txt']);
    assert.strictEqual(args[1], '_rename_me_first.txt ↔ renamed.txt');
  });
});
