import { Component, OnInit, AfterViewInit } from '@angular/core';
import { TOPBAR } from "../layouts.model";
import { EventService } from '../../core/services/event.service';
import { StorageService } from 'src/app/_services/storage.service';

@Component({
  selector: 'app-horizontal',
  templateUrl: './horizontal.component.html',
  styleUrls: ['./horizontal.component.scss']
})

/**
 * Horizontal-layout component
 */
export class HorizontalComponent implements OnInit, AfterViewInit {

  public topbar: string;

  public year: number = new Date().getFullYear();
  public version: any = {};

  constructor(private eventService: EventService, public _storage: StorageService) { }

  ngOnInit() {
    this.version = this._storage.version();
    this.topbar = TOPBAR;

    this.eventService.subscribe('changeTopbar', (topbar) => {
      this.topbar = topbar;
      this.changeTopbar(this.topbar);
    });

    document.body.setAttribute('data-layout', 'horizontal');
    document.body.removeAttribute('data-sidebar');
    document.body.removeAttribute('data-layout-size');
    document.body.removeAttribute('data-keep-enlarged');
    document.body.removeAttribute('data-sidebar-small');

    this.changeTopbar(this.topbar);
  }

  ngAfterViewInit() {
  }

  /**
   * on settings button clicked from topbar
   */
  onSettingsButtonClicked() {
    document.body.classList.toggle('right-bar-enabled');
  }

  changeTopbar(topbar: string) {
    switch (topbar) {
      case "light":
        document.body.setAttribute("data-topbar", "light");
        break;
      case "dark":
        document.body.setAttribute("data-topbar", "dark");
        break;
      case "colored":
        document.body.setAttribute("data-topbar", "colored");
        break;
      default:
        document.body.setAttribute("data-topbar", "dark");
        break;
    }
  }

}
