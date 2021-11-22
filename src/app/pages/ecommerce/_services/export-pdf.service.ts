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
      pageSize: 'A5',
      pageOrientation: 'portrait',
      content: [
        {
          canvas: [
            {
              type: 'rect',
              x: 0,
              y: -30,
              w: 350,
              h: 545,
              r: 30,
              lineColor: 'black'
            }
          ]
        },
        {
          image: await this.getBase64ImageFromURL("https://locker-products.s3.amazonaws.com/label/logo.jpg"),
          width: 250,
          alignment: "center",
          absolutePosition: { x: 55, y: 20 }
        },
        {
          canvas: [
            {
              type: 'rect',
              x: 30, y: -475,
              w: 285, h: 3,
              color: '#e8e9ea'
            }
          ]
        },
        [
          {
            text: 'Remite:',
            absolutePosition: { x: 70, y: 90 },
            color: '#4f5159;',
            fontSize: '18',
            'bold': true
          },
          {
            image: await this.getBase64ImageFromURL("https://locker-products.s3.amazonaws.com/label/caja.png"),
            height: 80,
            width: 80,
            absolutePosition: { x: 85, y: 125 }
          },
          {
            text: 'encargomio.com',
            color: '#f08001',
            fontSize: '15',
            'bold': true,
            absolutePosition: { x: 190, y: 120 }
          },
          {
            text: 'Calle 11 #24 - 75 \n La Ceja - Antioquia \n Tel: 318 242 8086',
            fontSize: '14',
            absolutePosition: { x: 190, y: 140 },
            color: '#4f5159'
          },
          {
            text: '+13053996614',
            fontSize: '14',
            color: '#4f5159',
            absolutePosition: { x: 210, y: 194 }
          }
        ],
        {
          canvas: [
            {
              type: 'rect',
              x: 30, y: -340,
              w: 285, h: 3,
              color: '#e8e9ea'
            }
          ]
        },
        [
          {
            text: 'Destino: ',
            color: '#4f5159',
            'bold': true,
            fontSize: '18',
            absolutePosition: { x: 70, y: 220 },
          },
          {
            image: await this.getBase64ImageFromURL("https://locker-products.s3.amazonaws.com/label/house.png"),
            height: 80,
            width: 80,
            absolutePosition: { x: 85, y: 270 }
          },
          {
            text: `${information.user.name} ${information.user.last_name}`,
            color: '#f08001',
            fontSize: '13',
            'bold': true,
            absolutePosition: { x: 180, y: 225 }
          },
          {
            text: `${address.address} ${address.description ? address.description : ''}\n${address.city.name}, ${address.department.name}\n Tel: ${address.phone ? address.phone : 'N/A'}`,
            fontSize: '10',
            color: '#4f5159',
            absolutePosition: { x: 180, y: 270 }
          },
        ],
        {
          canvas: [
            {
              type: 'rect',
              x: 30, y: -175,
              w: 285, h: 3,
              color: '#e8e9ea'
            }
          ]
        },
        {
          text: '¡Gracias por Elegirnos!',
          'bold': true,
          absolutePosition: { x: 50, y: 390 },
          color: '#1dd595',
          fontSize: 17,
          alignment: "center",
        },
        {
          text: 'Tu mejor aliado\n en compras y envíos.',
          absolutePosition: { x: 50, y: 420 },
        },
        {
          text: `UID: ${UID}`,
          absolutePosition: { x: 50, y: 460 },
          'bold': true,
          fontSize: 12
        }
      ],
      defaultStyle: {
        font: 'Poppins'
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
