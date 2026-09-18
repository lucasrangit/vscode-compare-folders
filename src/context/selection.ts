import { File } from '../models/file';
import { setContext } from './global';
import { HAS_SELECTED_FILE } from '../constants/contextKeys';

export class SelectionContext {
  private _selectedFile: File | undefined = undefined;
  private _selectedViewId: string | undefined = undefined;

  getSelectedFile(): File | undefined {
    return this._selectedFile;
  }

  getSelectedViewId(): string | undefined {
    return this._selectedViewId;
  }

  setSelectedFile(file: File | undefined, viewId?: string): void {
    this._selectedFile = file;
    this._selectedViewId = viewId;
    setContext(HAS_SELECTED_FILE, !!file);
  }

  clear(): void {
    this._selectedFile = undefined;
    this._selectedViewId = undefined;
    setContext(HAS_SELECTED_FILE, false);
  }
}

export const selectionContext = new SelectionContext();
