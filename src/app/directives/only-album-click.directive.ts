import { Directive, HostListener } from '@angular/core';
import { ContextMenuService } from '../services/context-menu.service';
import { ContextMenuType } from '../models/contextMenuType.model';
import { ContextMenuData } from '../models/contextMenuData.model';

@Directive({
  selector: '[appOnlyAlbumClick]'
})
export class OnlyAlbumClickDirective {

  constructor(private contextMenuService: ContextMenuService) {
  }

  @HostListener('click', ['$event']) onLeftClick(event: any) {
    if (this.contextMenuService.contextMenuOpen.getValue()) {
      this.contextMenuService.closeContextMenu();
    }
  }

  @HostListener('contextmenu', ['$event']) onRightClick(event: any) {
    this.contextMenuService.openContextMenu(new ContextMenuData(event, event.target.id));
  }

}
