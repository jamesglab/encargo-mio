export interface MenuItem {
    id?: number;
    label?: string;
    icon?: string;
    link?: string;
    showItem : boolean;
    subItems?: any;
    isTitle?: boolean;
    badge?: any;
    parentId?: number;
    isLayout?: boolean;
}
