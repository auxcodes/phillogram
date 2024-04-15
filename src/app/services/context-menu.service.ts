import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Vector2 } from '../models/vector2.model';
import { ContextMenuType } from '../models/contextMenuType.model';
import { ContextMenuData } from '../models/contextMenuData.model';

@Injectable({
  providedIn: 'root'
})
export class ContextMenuService {

  contextMenuOpen: BehaviorSubject<boolean>; 
  clickPosition: BehaviorSubject<Vector2>;
  contextMenuType: BehaviorSubject<ContextMenuType>;
  private focusObject!: ContextMenuData | undefined;

  constructor() {
    this.contextMenuOpen = new BehaviorSubject<boolean>(false);
    this.clickPosition = new BehaviorSubject<Vector2>({ x: 0, y: 0 });
    this.contextMenuType = new BehaviorSubject<ContextMenuType>(ContextMenuType.None);
  }

  openContextMenu(menuData: ContextMenuData) {
    if (menuData.objectType){
      this.contextMenuType.next(menuData.objectType);
      this.contextMenuOpen.next(true);
      this.clickPosition.next({ x: menuData.$event.clientX, y: menuData.$event.clientY });
      this.focusObject = menuData;
    }
  }

  closeContextMenu() {
    this.contextMenuOpen.next(false);
    this.contextMenuType.next(ContextMenuType.None);
    this.focusObject = undefined;
  }

  objectInFocus() {
    return this.focusObject;
  }
}
