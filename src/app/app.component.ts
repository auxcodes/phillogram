import { Component } from '@angular/core';
import { ContextMenuComponent } from './context-menu/context-menu.component';
import { ContextMenuService } from './services/context-menu.service';
import { Subscription } from 'rxjs';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  private contextMenuSub: Subscription;
  contextMenuOpen = false;

  constructor(private contextMenuService: ContextMenuService) {
     this.contextMenuSub = contextMenuService.contextMenuOpen.subscribe(open => this.contextMenuOpen = open );
  }

  onMainWindowClick() {
    if (this.contextMenuOpen) {
      this.contextMenuService.closeContextMenu();
    }
  }

}
