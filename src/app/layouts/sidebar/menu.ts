import { MenuItem } from './menu.model';

export const MENU: MenuItem[] = [
    {
        id: 1,
        label: 'General',
        showItem : false,
        icon: 'bx-store',
        subItems: [
            {
                id: 11,
                label: 'Cotizaciones',
                link: '/ecommerce/orders',
                parentId: 1,
                code : 'CO000',
                showItem: false
            },
            {
                id: 12,
                label: 'Envios',
                link: '/ecommerce/orders-shippings',
                parentId: 1,
                code : 'ENV000',
                showItem: false
            },
            {
                id: 13,
                label: 'Compras',
                link: '/purchases',
                parentId: 1,
                code : 'COM000',
                showItem: false
            },
            {
                id: 14,
                label: 'Pagos',
                link: '/ecommerce/customers',
                parentId: 1,
                code : 'PAG000',
                showItem: false
            },
            {
                id: 15,
                label: 'Cupones',
                link: '/cupons',
                parentId: 1,
                code : 'CUP000',
                showItem: false
            }
        ]
    },
    {
        id: 2,
        label: 'Productos',
        showItem : false,
        icon: 'bxl-dropbox',
        subItems: [
            {
                id: 21,
                label: 'General',
                link: '/products/all',
                parentId: 2,
                code : 'CO000',
                showItem: false
            },
            {
                id: 22,
                label: 'Producto',
                link: '/products/search',
                parentId: 2,
                code : 'ENV000',
                showItem: false
            }
        ]
    },
    {
        id: 3,
        label: 'Usuarios',
        icon: 'bxs-user-detail',
        showItem : false,
        subItems: [
            {
                id: 31,
                label: 'Roles y Permisos',
                link: '/contacts/grid',
                parentId: 3,
                code : 'ROL000',
                showItem: false
            },
            {
                id: 32,
                label: 'Lista de Usuarios',
                link: '/contacts/list',
                parentId: 3,
                code : 'US000',
                showItem: false
            }
        ]
    },
    {
        id: 4,
        label: 'Casillero',
        icon: 'bxs-box',
        showItem : false,
        subItems: [
            {
                id: 41,
                label: 'Casilleros',
                parentId: 4,
                link: '/lockers/locker',
                code : 'CAS000',
                showItem: false
            },
            {
                id: 42,
                label: 'Productos de usuario',
                parentId: 4,
                link: '/lockers/user-products',
                code : 'CAS100',
                showItem: false
            }
        ]
    }
];

