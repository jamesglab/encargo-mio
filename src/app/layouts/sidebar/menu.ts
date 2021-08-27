import { MenuItem } from './menu.model';

export const MENU: MenuItem[] = [
    {
        id: 12,
        label: 'MENUITEMS.ECOMMERCE.TEXT',
        icon: 'bx-store',
        subItems: [
            {
                id: 15,
                label: 'MENUITEMS.ECOMMERCE.LIST.ORDERS',
                link: '/ecommerce/orders',
                parentId: 12
            },

            {
                id: 155,
                label: 'MENUITEMS.ECOMMERCE.LIST.ORDER-BUY',
                link: '/ecommerce/orders-buy',
                parentId: 12
            },
            {
                id: 153,
                label: 'MENUITEMS.ECOMMERCE.LIST.ORDER-SHIPPING',
                link: '/ecommerce/orders-shippings',
                parentId: 12
            },
            {
                id: 16,
                label: 'MENUITEMS.ECOMMERCE.LIST.CUSTOMERS',
                link: '/ecommerce/customers',
                parentId: 12
            }
        ]
    },
    {
        id: 48,
        label: 'MENUITEMS.CONTACTS.TEXT',
        icon: 'bxs-user-detail',
        subItems: [
            {
                id: 49,
                label: 'MENUITEMS.CONTACTS.LIST.USERGRID',
                link: '/contacts/grid',
                parentId: 48
            },
            {
                id: 50,
                label: 'MENUITEMS.CONTACTS.LIST.USERLIST',
                link: '/contacts/list',
                parentId: 48
            }
        ]
    }
];

