import { Injectable } from '@angular/core';
import * as pdfMake from "pdfmake/build/pdfmake";
import * as pdfFonts from 'pdfmake/build/vfs_fonts';

(pdfMake as any).vfs = pdfFonts.pdfMake.vfs;

(pdfMake as any).fonts = {
  Poppins: {
    normal: `${location.origin}/assets/Poppins-Light.ttf`,
    bold: `${location.origin}/assets/Poppins-Bold.ttf`,
    italics: `${location.origin}/assets/Poppins-Light.ttf`,
    bolditalics: `${location.origin}/assets/Poppins-Light.ttf`
  }
}

@Injectable({
  providedIn: 'root'
})

export class ExportPdfService {

  constructor() { }

  async exportToLabel(information: any, address: any, UID: string) {
    const docDefinitions: any = {
      pageSize: 'A4',
      pageOrientation: 'landscape',
      margin: [0, 0, 0, 0],
      content: [
        {
          alignment: 'justify',
          columns: [
            {
              text: 'Hola!', style: 'header', alignment: 'center'
            },
            {
              text: 'Al momento de recibir tu envío\n esta etiqueta no debe \n estar rota o rasgada', alignment: 'center'
            }
          ]
        },
        {
          alignment: 'justify',
          columns: [
            {
              text: 'Somos tu mejor aliado\n en Compras y Envíos en el exterior', alignment: 'center'
            },
            {
              text: ''
            }
          ]
        },
        {
          alignment: 'justify',
          columns: [
            {
              text: 'Ideal para Negocios', alignment: 'center', bold: true
            },
            {
              text: ''
            }
          ]
        },
        {
          columns: [
            {
              width: '50%',
              table: {
                body: [
                  [
                    {
                      border: [false, false, false, false],
                      text: 'Remitente: ',
                    },
                    {
                      border: [false, false, false, false],
                      text: 'Encargomio\n Calle 11 #24 - 75\n La Ceja - Antioquia\n Tel: 318 242 8086'
                    },
                    {
                      border: [false, false, false, false],
                      text: 'Envío: 4108'
                    }
                  ],
                  [
                    {
                      rowSpan: 3,
                      border: [false, false, false, false],
                      text: 'Destinatario: '
                    },
                    {
                      colSpan: 2,
                      border: [false, false, false, false],
                      text: `${information.address ? information.address.first_name : ''}`
                    }
                  ],
                  [
                    {
                      rowSpan: 3,
                      border: [false, false, false, false],
                      text: 'xd: '
                    },
                    {
                      colSpan: 2,
                      border: [false, false, false, false],
                      text: `xd`
                    }
                  ],
                ]
              },
            },
            {
              width: '50%',
              text: 'Fourth column'
            }
          ],
          columnGap: 10
        }
      ],
      defaultStyle: {
        font: 'Poppins'
      },
      styles: {
        header: {
          fontSize: 30,
          bold: true,
          color: '#f5832a'
        }
      }
    };
    pdfMake.createPdf(docDefinitions).open();
  }

  getBase64ImageFromURL(url: any) {

    return new Promise((resolve, reject) => {
      var img = new Image();
      img.setAttribute("crossOrigin", "anonymous");
      img.onload = () => {
        var canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        var ctx: any = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);
        var dataURL = canvas.toDataURL("image/png");
        resolve(dataURL);
      };
      img.onerror = error => {
        reject(error);
      };
      img.src = url;
    });

  }


}
