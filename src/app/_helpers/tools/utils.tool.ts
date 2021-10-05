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

export const numberOnly = (event): boolean => {
    const charCode = (event.which) ? event.which : event.keyCode;
    if (charCode > 31 && (charCode < 46 || charCode > 57)) {
        return false;
    }
    return true;
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
            status_name = 'Consolidación'
            break
        case '1':
            status_name = 'Por empacar'
            break


        case '2':
            status_name = 'En generación de guía'
            break
        case '3':
            status_name = 'Enviado'
            break
        case '4':
            status_name = 'Cancelado'
            break
        case '5':
            status_name = 'Pago en revisión'
            break

        case '6':
            status_name = 'Fragmentado'
            break
        default:
            break;
    }
    return status_name

}
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

export const dataURLtoFile = (dataurl, filename) => { // Método para convertir una URL en un tipo File para la librería ngx dropzone
    var arr = dataurl.split(','),
        bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
    while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: "image/jpeg" });
}