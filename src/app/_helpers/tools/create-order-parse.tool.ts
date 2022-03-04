export const getInsertCreateOrder = (user: any, products: any, calculations: any, trm: any, advance_purchase: boolean): any => {

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
        advance_purchase,
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
        "order_purchase": (data.order_purchase ? data.order_purchase : null),
        "locker": (data.locker ? data.locker : null),
        "permanent_shipping_value": (data.permanent_shipping_value ? data.permanent_shipping_value : 0),
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
        "locker": data.locker_info.locker_id,
        "weight": (data.weight ? data.weight : 0),
        "images": (data.images ? data.images : []),
        "deleted_images": (data.deleted_images ? data.deleted_images : null)
    };

    return locker;

}

export const updateShipping = (data: any): any => {

    let shipping = {
        "id": data.id ? data.id : null,
        "address": data.address ? data.address.id : null,
        "conveyor": data.conveyor ? data.conveyor.id : null,
        "deleted_products": data.deleted_products ? data.deleted_products : null,
        "delivery_date": data.delivery_date ? data.delivery_date : null,
        "guide_number": data.guide_number ? data.guide_number : null,
        "observations": data.observations ? data.observations : null,
        "products": data.products ? data.products : [],
        "shipping_type": data.shipping_type ? data.shipping_type : null,
        "status": data.status,
        "total_value": data.total_value ? data.total_value : 0,
        "consolidated": data.consolidated ? data.consolidated : null,
        "trm": data.trm,
        "user": data.user,
        "new_shipping": data.newShipping ? data.newShipping : [],
        "total_weight": data.total_weight ? data.total_weight : 0
    };

    return shipping;

};

export const insertOnlyLocker = (form: any, order_service: string, products: any): any => {

    let data = {
        "id": form.id ? form.id : null,
        "locker": form.user.id,
        "guide_number": form.guide_number ? form.guide_number : null,
        "order_service": order_service ? order_service : null,
        "conveyor": form.conveyor.id,
        "products": products ? products : [],
        "receipt_date": new Date(form.receipt_date.year, form.receipt_date.month - 1, form.receipt_date.day)
    };

    return data;
};

export const tranformFormItemNotIncome = (data: any): any => {

    let transfrom = {
        "product": {
            "id": data.product.value.id,
            "name": data.name.value,
            "permanent_shipping_value": data.permanent_shipping_value.value,
            "quantity": data.quantity.value,
            "description": data.description.value,
            "aditional_info": data.aditional_info.value,
            "image": data.scrap_image.value,
            "pending_quantity": data.pending_quantity ? data.pending_quantity?.value : null
        },
        "product_price": data.declared_value_admin.value,
        "declared_value_admin": data.declared_value_admin.value,
        "weight": data.weight.value,
        "order_service": data.order_service.value,
        "images": data.images.value,
        "invoice_images": data.invoice_images.value,
        "force_commercial_shipping": data.force_commercial_shipping.value,
        "free_shipping": data.free_shipping.value,
        "secuential_fraction": data.secuential_fraction.value,
        "id": data.id.value
    };

    return transfrom;

};