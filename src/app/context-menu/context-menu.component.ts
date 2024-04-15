import { Component, OnInit } from '@angular/core';
import { Vector2 } from '../models/vector2.model';
import { ContextMenuService } from '../services/context-menu.service';
import { AuthenticationService } from '../services/authentication.service';
import { Subscription } from 'rxjs';
import { ContextMenuType } from '../models/contextMenuType.model';

@Component({
  selector: 'app-context-menu',
  templateUrl: './context-menu.component.html',
  styleUrls: ['./context-menu.component.scss']
})
export class ContextMenuComponent implements OnInit {

  private contextMenuSub: Subscription;
  private menuTypeSub: Subscription;
  menuPos: Vector2;
  menuType!: ContextMenuType;

  constructor(
    private contextMenuService: ContextMenuService,
    private authService: AuthenticationService
  ) {
    this.menuPos = {x: 0, y: 0};
    this.contextMenuSub = contextMenuService.clickPosition.subscribe(position => this.menuPos = position);
    this.menuTypeSub = contextMenuService.contextMenuType.subscribe(type => this.menuType = type);
  }

  ngOnInit() {
  }

  closeContextMenu() {
    this.contextMenuService.closeContextMenu();
  }

  onMainContainerClick() {
    this.closeContextMenu();
  }

  onRightClick() {
    this.closeContextMenu();
  }

  isImageMenu() {
    return this.menuType == ContextMenuType.Image;
  }

  isAlbumMenu() {
    return this.menuType == ContextMenuType.Album;
  }

  hasAccess(): boolean {
    return this.authService.canUpload();
  }

}
