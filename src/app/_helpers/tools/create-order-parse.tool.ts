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