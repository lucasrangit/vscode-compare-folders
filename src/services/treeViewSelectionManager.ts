import { TreeView, Disposable } from 'vscode';
import { File } from '../models/file';
import { BaseViewProvider } from '../providers/baseViewProvider';
import { selectionContext } from '../context/selection';

export class TreeViewSelectionManager {
  private registeredViews: Map<string, { treeView: TreeView<File>; provider: BaseViewProvider }> = new Map();
  private isClearing: boolean = false;

  register(viewId: string, treeView: TreeView<File>, provider: BaseViewProvider): Disposable {
    this.registeredViews.set(viewId, { treeView, provider });

    const selectionSubscription = treeView.onDidChangeSelection((e) => {
      if (this.isClearing) {
        return;
      }

      if (e.selection.length > 0) {
        const selectedItem = e.selection[0];
        if (selectedItem.type === 'file' || selectedItem.type === 'file-parsable') {
          selectionContext.setSelectedFile(selectedItem, viewId);
          this.isClearing = true;
          for (const [id, entry] of this.registeredViews) {
            if (id !== viewId) {
              entry.provider.clearSelection();
            }
          }
          this.isClearing = false;
        } else {
          selectionContext.clear();
        }
      } else {
        if (selectionContext.getSelectedViewId() === viewId) {
          selectionContext.clear();
        }
      }
    });

    return {
      dispose: (): void => {
        selectionSubscription.dispose();
        this.registeredViews.delete(viewId);
      },
    };
  }

  clearAll(): void {
    selectionContext.clear();
    this.isClearing = true;
    for (const entry of this.registeredViews.values()) {
      entry.provider.clearSelection();
    }
    this.isClearing = false;
  }
}

export const treeViewSelectionManager = new TreeViewSelectionManager();
