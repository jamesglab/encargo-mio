import { Component, OnInit, AfterViewInit, Inject, HostListener } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { DOCUMENT } from '@angular/common';
import { StorageService } from 'src/app/_services/storage.service';
import { MENU } from '../sidebar/menu';
import { MenuItem } from '../sidebar/menu.model';

@Component({
    selector: 'app-horizontaltopbar',
    templateUrl: './horizontaltopbar.component.html',
    styleUrls: ['./horizontaltopbar.component.scss']
})

export class HorizontaltopbarComponent implements OnInit, AfterViewInit {

    public menuItems: any = [];

    public user: any = {};

    public element: any;

    public innerWidth: number = 0;
    public isResponsive: boolean = false;

    constructor(
        @Inject(DOCUMENT) private document: any,
        private router: Router, private _storage: StorageService
    ) { }

    ngOnInit(): void {
        this.initialize();
        this.user = this._storage.getItem("currentUser");
        this.element = document.documentElement;
        this.onResize();
    }

    @HostListener('window:resize', ['$event'])
    onResize(event?) {
        this.innerWidth = window.innerWidth;
        if (this.innerWidth <= 900) {
            this.isResponsive = true;
        } else {
            this.isResponsive = false;
        }
    }


    logout() {
        localStorage.clear();
        this.router.navigate(['/account/login']);
    }

    /**
     * On menu click
     */
    onMenuClick(event) {
        const nextEl = event.target.nextElementSibling;
        if (nextEl) {
            const parentEl = event.target.parentNode;
            if (parentEl) {
                parentEl.classList.remove("show");
            }
            nextEl.classList.toggle("show");
        }
        return false;
    }

    ngAfterViewInit() {
    }

    /**
     * remove active and mm-active class
     */
    _removeAllClass(className) {
        const els = document.getElementsByClassName(className);
        while (els[0]) {
            els[0].classList.remove(className);
        }
    }

    /**
     * Togglemenu bar
     */
    toggleMenubar() {
        const element = document.getElementById('topnav-menu-content');
        element.classList.toggle('show');
    }

    /**
     * on settings button clicked from topbar
     */
    onSettingsButtonClicked() {
        document.body.classList.toggle('right-bar-enabled');
    }

    fullscreen() {
        document.body.classList.toggle('fullscreen-enable');
        if (
            !document.fullscreenElement && !this.element.mozFullScreenElement &&
            !this.element.webkitFullscreenElement) {
            if (this.element.requestFullscreen) {
                this.element.requestFullscreen();
            } else if (this.element.mozRequestFullScreen) {
                /* Firefox */
                this.element.mozRequestFullScreen();
            } else if (this.element.webkitRequestFullscreen) {
                /* Chrome, Safari and Opera */
                this.element.webkitRequestFullscreen();
            } else if (this.element.msRequestFullscreen) {
                /* IE/Edge */
                this.element.msRequestFullscreen();
            }
        } else {
            if (this.document.exitFullscreen) {
                this.document.exitFullscreen();
            } else if (this.document.mozCancelFullScreen) {
                /* Firefox */
                this.document.mozCancelFullScreen();
            } else if (this.document.webkitExitFullscreen) {
                /* Chrome, Safari and Opera */
                this.document.webkitExitFullscreen();
            } else if (this.document.msExitFullscreen) {
                /* IE/Edge */
                this.document.msExitFullscreen();
            }
        }
    }

    /**
     * Initialize
     */
    initialize(): void {
        this.menuItems = [];
        const permissions = this._storage.getItem("permissions");
        // RECORREMOS LOS PERMISOS
        let new_menu = MENU;
        //RECORREMOS LOS ITEMS PRINCIPALES
        new_menu.map((m, i) => {
            //BANDERA DE ACCESO AL MODULO
            let validate_menu = false;
            //RECORREMOS LOS SUBITEMS QUE TIENEN LOS ACCESOS A LOS MODULOS
            if (m.subItems) {
                m.subItems.map((sub) => {
                    //VALIDAMOS QUE EL CODIGO RECORRIDO SEA IGUAL A MODULO AL QUE VAMOS A DAR ACCESO
                    if (permissions[sub.code]) {
                        //ANEXAMOS EL PERMISO AL MODULO
                        //DAMOS ACCESO AL SELECTOR DEL MODULO
                        sub.showItem = true;
                        new_menu[i].showItem = true;
                        validate_menu = true;
                    } else {
                        //DENEGAMOS EL ACCESO AL MODULO
                        sub.showItem = false;
                    }
                });

                //SI NO TENEMOS ACCESO AL MODULO LO DENEGAMOS
                if (!validate_menu) {
                    new_menu[i].showItem = false;
                }
                validate_menu = false;
            }
        });
        //ASIGNAMOS EL MENU
        this.menuItems = new_menu;
    }

    /**
     * Returns true or false if given menu item has child or not
     * @param item menuItem
     */
    hasItems(item: MenuItem) {
        return item.subItems !== undefined ? item.subItems.length > 0 : false;
    }

}