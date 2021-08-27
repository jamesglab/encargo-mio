export const getInsertCreateOrder = (user: any, products: any): any => {
    // console.log("USER: ", user);
    // console.log("PRODUCTS: ", products);
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
        "products": [...products]
    };

    return order;

};