import { MatSnackBarConfig } from '@angular/material/snack-bar';
export const notificationConfig = (type: number, duration: number, message?: string): MatSnackBarConfig => {

    let _configType = { 1: "is-success", 2: "is-warning", 3: "is-danger" };
    // console.log("typpee", type)
    return {
        panelClass: ["notification", _configType[type], "is-light", "fade", "show"],
        data: { message: (type === 3) ? (message) ? message : "Nuestro servidor presenta problemas, intentalo nuevamente" : message },
        duration: duration,
        horizontalPosition: "end",
        verticalPosition: "bottom"
    }
}

export const isSwitched = (item: string) => {

    let isAllowed = {
        "weigth": true,
        "discount": true,
        "shipping_origin_value_product": true,
        "permanent_shipping_value": true
    }

    return isAllowed[item];

}

export const isRequired = (item: string) => {

    let isRequired = {
        "link": true,
        "name": true,
        "aditional_info": true,
        "image": true,
        "description": true
    };

    return isRequired[item];
}

export const numberOnly = (event): boolean => {
    const charCode = (event.which) ? event.which : event.keyCode;
    if (charCode > 31 && (charCode < 46 || charCode > 57)) {
        return false;
    }
    return true;
}