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