import { MatSnackBarConfig } from '@angular/material/snack-bar';
export const notificationConfig = (type: number, duration: number, message?: string): MatSnackBarConfig => {

    let _configType = { 1: "is-success", 2: "is-warning", 3: "is-danger" };

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
        "weight": true,
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

export const disabledItems = (item: string) => {

    let isRequired = {
        order_service: true,
        guide_number: true,
        product: false,
        observations: true,
        store: true,
        product_price: true,
        purchase_date: true,
        invoice_number: true,
        locker_entry_date: true,
        conveyor: true,
        sold_out: false
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

export const GET_STATUS = (state: string) => {

    let status = {
        "0": "Por aprobar",
        "1": "Cotizada",
        "2": "En Pago",
        "3": "Proceso compra",
        "4": "Ingresar Producto",
        "5": "Finalizada",
        "6": "Cancelada",
        "7": "Vencida"
    };
    return status[state || status['0']];
}

export const validateShippingstatus = (status) => {
    // 0 Consolidación (Viene de ordenes de compra)
    // 1 Por empacar (En espera de que el administrador realice el envío) (INCLUIR BOTON DE EMPACADO)
    // 2 En generación de guía (Alistamiento o Por preparar)
    // 3 Enviado (La orden ha sido enviada y depende de la transportadora)
    //  -------------------- EN ESTE PUNTO RENDERIZAMOS ESTADOS DE LA TRANSPORTADORA--------
    // 4 Cancelado (La orden ha sido cancelada)
    // 5 Pago en revisión (El Pago esta pendiente)
    // 6 Fragmentado
    let status_name;
    switch (status) {
        case '0':
            status_name = 'Consolidación';
            break;
        case '1':
            status_name = 'Por empacar';
            break;
        case '2':
            status_name = 'En generación de guía';
            break;
        case '3':
            status_name = 'Enviado';
            break;
        case '4':
            status_name = 'Cancelado';
            break;
        case '5':
            status_name = 'Pago en revisión'
            break;
        case '6':
            status_name = 'Fraccionado';
            break;
        case '7':
            status_name = 'Entregado'
            break;
        default:
            break;
    }
    return status_name

}

export const SHIPPING_STATUS = [
    { "status": 0, "name": "Consolidación", "english": "consolidation" },
    { "status": 1, "name": "Por empacar", "english": "for_packing" },
    { "status": 2, "name": "En generación de guía", "english": "in_guide" },
    { "status": 3, "name": "Enviado", "english": "sended" },
    { "status": 7, "name": "Entregado", "english": "delivered" },
    { "status": 4, "name": "Cancelado", "english": "cancel" },
    { "status": 5, "name": "Pago en revisión", "english": "in_check" },
    { "status": 6, "name": "Fraccionado", "english": "fragmented" }
];

// MEOTODO QUE RECIBE UN ARRAY Y LOS CAMPOS QUE SON REQUERIDOS EN LA SOLICITUD
// objectsValidate : [{},{},{}]
// validators : ['name',description,'value'...etc]
export const validateErrors = (objectsValidate, validators) => {
    let validate = false;
    objectsValidate.map(p => {
        validators.map(validator => { if (p[validator] == null || p[validator] == undefined || p[validator] == '') { validate = true } })
    });
    return validate
}

export const dataURLtoFile = (dataurl, filename) => { // Método para convertir una URL en un tipo 
    var arr = dataurl.split(','),
        bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
    while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: "image/jpeg" });
}