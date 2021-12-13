import { MenuItem } from './menu.model';

export const MENU: MenuItem[] = [
    {
        id: 12,
        label: 'Pedidos',
        showItem : false,
        icon: 'bx-store',
        subItems: [
            {
                id: 15,
                label: 'Cotizaciones',
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
                label: 'Envios',
                link: '/ecommerce/orders-shippings',
                parentId: 12,
                code : 'ENV000',
                showItem: false
            },
            {
                id: 154,
                label: 'Compras',
                link: '/purchases',
                parentId: 12,
                code : 'COM000',
                showItem: false
            },
            {
                id: 16,
                label: 'Pagos',
                link: '/ecommerce/customers',
                parentId: 12,
                code : 'PAG000',
                showItem: false
            },
            {
                id: 17,
                label: 'Cupones',
                link: '/cupons',
                parentId: 12,
                code : 'CUP000',
                showItem: false
            }
        ]
    },
    {
        id: 48,
        label: 'Usuarios',
        icon: 'bxs-user-detail',
        showItem : false,
        subItems: [
            {
                id: 49,
                label: 'Roles y Permisos',
                link: '/contacts/grid',
                parentId: 48,
                code : 'ROL000',
                showItem: false
            },
            {
                id: 50,
                label: 'Lista de Usuarios',
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
                label: 'Productos de usuario',
                parentId: 1,
                link: '/lockers/user-products',
                code : 'CAS000',
                showItem: false
            },
        ]
    }
];

