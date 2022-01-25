import { Injectable } from '@angular/core';
import { Workbook } from 'exceljs';
import * as fs from 'file-saver';
const EXCEL_TYPE =
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
const EXCEL_EXTENSION = '.xlsx';

@Injectable({
    providedIn: 'root'
})

export class ExportExcelService {

    constructor() { }

    async exportConsolidateWithStyles(json, excelFileName) {
        //CREAMOS EL LIBRO DE EXCEL
        const workbook = new Workbook();
        //MAPEAMOS LOS OBJETOS
        Object.keys(json).map((key, i) => {
            //   //CREAMOS LA HOJA DE CADA CONSULTA
            const sheet = workbook.addWorksheet(key, {});
            //RECORREMOS EL PRIMER OBJETO PARA ACCEDER A LAS CABECERAS DEL OBJETO
            Object.keys(json[key][0]).map((headerStyle, i) => {
                //ACCEDEMOS A LAS CABECERAS
                const headers_styles = sheet.getCell(`${this.createCeld(i + 1)}1`);
                //ESTILOS DE COLORES EN CABECERAS
                headers_styles.fill = {
                    type: 'pattern',
                    pattern: 'darkVertical',
                    fgColor: { argb: 'fbb581' },
                };

                //ESTILOS DE FUENTES EN CABECERAS
                headers_styles.font = {
                    family: 4,
                    size: 12,
                    bold: true,
                };
                //ESTILOS DE BORDES EN CABECERAS
                headers_styles.border = {
                    top: { style: 'thin' },
                    left: { style: 'thin' },
                    bottom: { style: 'thin' },
                    right: { style: 'thin' },
                };
            });

            //CREAMOS LOS HEADERS POR OBJETO
            const uniqueHeaders = [
                ...new Set(
                    json[key].reduce((prev, next) => [...prev, ...Object.keys(next)], [])
                ),
            ];

            //AGREGAMOS LAS COLUMNAS DE LA TABLA
            sheet.columns = uniqueHeaders.map((x: any) => (this.obtainWidth(x)));
            //MAPEAMOS CADA OBJETO EN UNA HOJA DE EXCEL
            json[key].map((jsonRow, i) => {
                let cellValues = { ...jsonRow };
                //AGREGAMOS LOS OBJETOS
                sheet.addRow(cellValues);
            });
        });

        const buffer = await workbook.xlsx.writeBuffer();

        const data: Blob = new Blob([buffer], { type: EXCEL_TYPE });
        fs.saveAs(data, new Date().getTime() + excelFileName.replace(" ", "_") + EXCEL_EXTENSION);
    }

    private createCeld(position) {
        let celd = '';

        switch (position) {
            case 1:
                celd = 'A';
                break;

            case 2:
                celd = 'B';

                break;
            case 3:
                celd = 'C';

                break;
            case 4:
                celd = 'D';

                break;
            case 5:
                celd = 'E';

                break;
            case 6:
                celd = 'F';

                break;
            case 7:
                celd = 'G';

                break;
            case 8:
                celd = 'H';

                break;
            case 9:
                celd = 'I';

                break;
            case 10:
                celd = 'J';

                break;
            case 11:
                celd = 'K';

                break;
            case 12:
                celd = 'L';

                break;
            case 13:
                celd = 'M';

                break;
            case 14:
                celd = 'N';

                break;
            case 15:
                celd = 'O';

                break;
            case 16:
                celd = 'P';

                break;
            case 17:
                celd = 'Q';

                break;
            case 18:
                celd = 'R';

                break;

            case 19:
                celd = 'S';

                break;
            case 20:
                celd = 'T';

                break;
            case 21:
                celd = 'U';

                break;
            case 22:
                celd = 'V';

                break;
            case 23:
                celd = 'W';

                break;
            case 24:
                celd = 'X';

                break;
            case 25:
                celd = 'Y';

                break;

            case 26:
                celd = 'Z';

                break;
            default:
                break;
        }

        if (celd) {
            return celd;
        }
    }

    obtainWidth(x) {
        return {
            header: x,
            key: x,
            width: 25,
        }
    }

}