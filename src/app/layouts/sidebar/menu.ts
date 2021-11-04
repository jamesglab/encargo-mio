import { MenuItem } from './menu.model';

export const MENU: MenuItem[] = [
    {
        id: 12,
        label: 'MENUITEMS.ECOMMERCE.TEXT',
        showItem : false,
        icon: 'bx-store',
        subItems: [
            {
                id: 15,
                label: 'MENUITEMS.ECOMMERCE.LIST.ORDERS',
                link: '/ecommerce/orders',
                parentId: 12,
                code : 'CO000',
                showItem: false
            },

            // {
            //     id: 155,
            //     label: 'MENUITEMS.ECOMMERCE.LIST.ORDER-BUY',
            //     link: '/ecommerce/orders-buy',
            //     parentId: 12
            // },
            {
                id: 153,
                label: 'MENUITEMS.ECOMMERCE.LIST.ORDER-SHIPPING',
                link: '/ecommerce/orders-shippings',
                parentId: 12,
                code : 'ENV000',
                showItem: false
            },
            {
                id: 154,
                label: 'MENUITEMS.ECOMMERCE.LIST.PURCHASE',
                link: '/purchases',
                parentId: 12,
                code : 'COM000',
                showItem: false
            },
            {
                id: 16,
                label: 'MENUITEMS.ECOMMERCE.LIST.CUSTOMERS',
                link: '/ecommerce/customers',
                parentId: 12,
                code : 'PAG000',
                showItem: false
            },
            {
                id: 17,
                label: 'MENUITEMS.ECOMMERCE.LIST.CUPONS',
                link: '/cupons',
                parentId: 12,
                code : 'CUP000',
                showItem: false
            }
        ]
    },
    {
        id: 48,
        label: 'MENUITEMS.CONTACTS.TEXT',
        icon: 'bxs-user-detail',
        showItem : false,
        subItems: [
            {
                id: 49,
                label: 'MENUITEMS.CONTACTS.LIST.USERGRID',
                link: '/contacts/grid',
                parentId: 48,
                code : 'ROL000',
                showItem: false
            },
            {
                id: 50,
                label: 'MENUITEMS.CONTACTS.LIST.USERLIST',
                link: '/contacts/list',
                parentId: 48,
                code : 'US000',
                showItem: false
            }
        ]
    },
    {
        id: 1,
        label: 'Casillero',
        icon: 'bxs-box',
        showItem : false,
        subItems: [
            {
                id: 2,
                label: 'Casilleros',
                parentId: 1,
                link: '/lockers/locker',
                code : 'CAS000',
                showItem: false
            },
            {
                id: 3,
                label: 'Ingresar a Casillero',
                parentId: 1,
                modale: 'modal_locker_entry',
                link: '/lockers/locker',
                code : 'CAS000',
                showItem: false
            }
        ]
    }
];

