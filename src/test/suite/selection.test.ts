import * as assert from 'assert';
import { selectionContext } from '../../context/selection';
import { treeViewSelectionManager } from '../../services/treeViewSelectionManager';
import { ViewOnlyProvider } from '../../providers/viewOnlyProvider';
import { MockTreeView } from './mocks/treeView';
import { File } from '../../models/file';
import { TreeItemCollapsibleState } from 'vscode';

suite('Selection Context & Manager', () => {
  setup(() => {
    selectionContext.clear();
  });

  test('selectionContext sets and clears selected file', () => {
    const file = new File({
      label: 'test.ts',
      type: 'file',
      collapsibleState: TreeItemCollapsibleState.None,
    });

    selectionContext.setSelectedFile(file, 'viewA');
    assert.strictEqual(selectionContext.getSelectedFile(), file);
    assert.strictEqual(selectionContext.getSelectedViewId(), 'viewA');

    selectionContext.clear();
    assert.strictEqual(selectionContext.getSelectedFile(), undefined);
    assert.strictEqual(selectionContext.getSelectedViewId(), undefined);
  });

  test('treeViewSelectionManager clears other tree views when selecting file in one view', () => {
    const providerA = new ViewOnlyProvider();
    const treeViewA = new MockTreeView();
    providerA.setTreeView(treeViewA);

    const providerB = new ViewOnlyProvider();
    const treeViewB = new MockTreeView();
    providerB.setTreeView(treeViewB);

    let clearedBCount = 0;
    let clearedACount = 0;

    providerB.onDidChangeTreeData(() => {
      clearedBCount++;
    });
    providerA.onDidChangeTreeData(() => {
      clearedACount++;
    });

    const subA = treeViewSelectionManager.register('viewA', treeViewA, providerA);
    const subB = treeViewSelectionManager.register('viewB', treeViewB, providerB);

    try {
      const fileA = new File({
        label: 'fileA.ts',
        type: 'file',
        collapsibleState: TreeItemCollapsibleState.None,
      });

      treeViewA.fireSelectionChange([fileA]);

      assert.strictEqual(selectionContext.getSelectedFile(), fileA);
      assert.strictEqual(selectionContext.getSelectedViewId(), 'viewA');
      assert.strictEqual(clearedBCount, 1);

      const fileB = new File({
        label: 'fileB.ts',
        type: 'file',
        collapsibleState: TreeItemCollapsibleState.None,
      });

      treeViewB.fireSelectionChange([fileB]);

      assert.strictEqual(selectionContext.getSelectedFile(), fileB);
      assert.strictEqual(selectionContext.getSelectedViewId(), 'viewB');
      assert.strictEqual(clearedACount, 1);
    } finally {
      subA.dispose();
      subB.dispose();
    }
  });

  test('treeViewSelectionManager clears selectionContext when folder item is selected', () => {
    const provider = new ViewOnlyProvider();
    const treeView = new MockTreeView();
    provider.setTreeView(treeView);

    const sub = treeViewSelectionManager.register('viewA', treeView, provider);

    try {
      const folderItem = new File({
        label: 'someFolder',
        type: 'folder',
        collapsibleState: TreeItemCollapsibleState.Collapsed,
      });

      treeView.fireSelectionChange([folderItem]);
      assert.strictEqual(selectionContext.getSelectedFile(), undefined);
    } finally {
      sub.dispose();
    }
  });
});
