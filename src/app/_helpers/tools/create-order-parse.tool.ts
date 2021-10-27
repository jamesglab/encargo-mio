export const getInsertCreateOrder = (user: any, products: any, calculations: any, trm: any): any => {
    console.log("CALCULATIONS", calculations);
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
        // "home_value": calculations ? parseFloat(calculations.shipping_usd) : 0,
        // "shipping_value": calculations ? calculations.value : 0,
        "shipping_value_admin": calculations,
        "products": [...products]
    };

    return order;

};

export const insertInLocker = (data: any): any => {

    let locker = {
        "guide_number": (data.guide_number ? data.guide_number : null),
        "guide_number_alph": (data.guide_number_alph ? data.guide_number_alph : null),
        "order_purchase": (data.order_purchase ? data.order_purchase : null),
        "locker": (data.locker ? data.locker : null),
        "product": (data.product ? data.product : null),
        "product_description": (data.product_description ? data.product_description : null),
        "weight": (data.weight ? data.weight : 0),
        "receipt_date": new Date(data.receipt_date.year, data.receipt_date.month - 1, data.receipt_date.day),
        "shipping_value": (data.shipping_value ? data.shipping_value : 0),
        "declared_value_admin": (data.declared_value_admin ? data.declared_value_admin : 0),
        "conveyor": (data.conveyor ? data.conveyor : null),
        "force_commercial_shipping": data.force_commercial_shipping,
        "user": (data.user ? data.user : null),
        "product_observations": (data.product_observations ? data.product_observations : null)
    };

    return locker;

}

export const updateLocker = (data: any): any => {

    let locker = {
        "id": (data.id ? data.id : null),
        "conveyor": (data.conveyor ? data.conveyor : null),
        "receipt_date": new Date(data.date_recieved.year, data.date_recieved.month - 1, data.date_recieved.day),
        "declared_value_admin": (data.declared_value_admin ? data.declared_value_admin : 0),
        "force_commercial_shipping": (data.force_commercial_shipping ? data.force_commercial_shipping : 0),
        "guide_number": (data.guide_number ? data.guide_number : null),
        "product_id": (data.product ? data.product.id : null),
        "product_name": (data.name ? data.name : ''),
        "product_description": (data.product_description ? data.product_description : null),
        "permanent_shipping_value": (data.permanent_shipping_value ? data.permanent_shipping_value : 0),
        "weight": (data.weight ? data.weight : 0),
        "images": (data.images ? data.images : [])
    };

    return locker;

}

export const updateShipping = (data: any): any => {

    let shipping = {
        "id": data.id,
        "address": data.address.id,
        "conveyor": data.conveyor.id,
        "deleted_products": data.deleted_products,
        "delivery_date": data.delivery_date,
        "guide_number": data.guide_number,
        "observations": data.observations,
        "products": data.products,
        "shipping_type": data.shipping_type,
        "status": data.status,
        "total_value": data.total_value,
        "trm": data.trm,
        "user": data.user
    };

    return shipping;

};
