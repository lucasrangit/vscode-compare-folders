import { TreeDataProvider, EventEmitter, Event, TreeView, type TreeItem } from 'vscode';
import { File } from '../models/file';
import { getConfiguration } from '../services/configuration';

export abstract class BaseViewProvider implements TreeDataProvider<File> {
  protected _onDidChangeTreeData = new EventEmitter<any | undefined>();
  readonly onDidChangeTreeData: Event<any | undefined> = this._onDidChangeTreeData.event;
  protected treeView?: TreeView<File>;
  private viewVersion: number = 0;

  setTreeView(treeView: TreeView<File>): void {
    this.treeView = treeView;
  }

  updateCount(count: number): void {
    if (this.treeView) {
      this.treeView.description = getConfiguration('showFileCount') ? `(${count})` : undefined;
    }
  }

  getViewVersion(): number {
    return this.viewVersion;
  }

  getParent(element: File): File | undefined {
    return element.parent;
  }

  clearSelection(): void {
    this.viewVersion++;
    if (this.treeView) {
      const children = this.getChildren();
      if (children && children.length > 0) {
        try {
          this.treeView.reveal(children[0], { select: false, focus: false });
        } catch {
          // ignore
        }
      }
    }
    this._onDidChangeTreeData.fire(null);
  }

  abstract getTreeItem(element: File): TreeItem;
  abstract getChildren(element?: File): File[];
}
