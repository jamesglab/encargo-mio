export const getInsertCreateOrder = (user: any, products: any, calculate: any, trm: any): any => {

    let order = {
        "user": {
            "id": user.id,
            "locker_id": user.locker_id,
            "locker_name": user.locker_name,
            "role_id": user.role_id,
            "email": user.email,
            "name": user.name,
            "last_name": user.last_name,
            "number_identification": user.number_identification,
            "role_name": user.role_name
        },
        "trm": {
            "id": trm.id,
            "value": trm.value,
            "created_at": trm.created_at,
            "updated_at": trm.updated_at
        },
        "home_value": calculate ? parseFloat(calculate.shipping_usd) : 0,
        "shipping_value": calculate ? calculate.value : 0,
        "products": [...products]
    };

    return order;

};

export const insertInLocker = (data: any): any => {

    let locker = {
        "guide_number": (data.guide_number ? data.guide_number : null),
        "order_purchase": (data.order_purchase ? data.order_purchase : null),
        "locker": (data.locker ? data.locker : null),
        "product": (data.product ? data.product : null),
        "product_description": (data.product_description ? data.product_description : null),
        "weight": (data.weight ? data.weight : 0),
        "receipt_date": new Date(data.receipt_date.year, data.receipt_date.month, data.receipt_date.day),
        "shipping_value": (data.shipping_value ? data.shipping_value : 0),
        "declared_value_admin": (data.declared_value_admin ? data.declared_value_admin : 0),
        "conveyor": (data.conveyor ? data.conveyor : null),
        "force_commercial_shipping": data.force_commercial_shipping,
        "user": (data.user ? data.user : null),
        "product_observations": (data.product_observations ? data.product_observations : null)
    };

    return locker;

}