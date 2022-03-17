import { ChangeDetectorRef, Component, HostListener, OnInit } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { WebcamImage, WebcamInitError, WebcamUtil } from 'ngx-webcam';
import Swal from 'sweetalert2';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-take-photo',
  templateUrl: './take-photo.component.html',
  styleUrls: ['./take-photo.component.scss']
})

export class TakePhotoComponent implements OnInit {

  public allowCameraSwitch: boolean = true;
  public multipleWebcamsAvailable: boolean = false;

  public videoOptions: MediaTrackConstraints = {
    width: { ideal: 1024 }, height: { ideal: 800 }
  };

  public width: number;

  public errors: WebcamInitError[] = [];

  private trigger: Subject<void> = new Subject<void>();

  public webcamImage: any = null;
  public position: number = null;

  constructor(public _modal: NgbActiveModal, public _cdr: ChangeDetectorRef) { }

  @HostListener('window:resize', ['$event'])
  onResize(event?: Event) {
    const win = !!event ? (event.target as Window) : window;
    this.width = win.innerWidth;
    this._cdr.detectChanges();
  }

  public ngOnInit(): void {
    this.onResize();
    WebcamUtil.getAvailableVideoInputs()
      .then((mediaDevices: MediaDeviceInfo[]) => {
        this.multipleWebcamsAvailable = mediaDevices && mediaDevices.length > 1;
      });
  }

  public triggerSnapshot(): void {
    this.trigger.next();
  }

  public handleInitError(error: WebcamInitError): void {
    this.errors.push(error);
    console.log(this.errors);
  }

  public handleImage(webcamImage: WebcamImage): void {
    this.webcamImage = webcamImage.imageAsDataUrl;
    Swal.fire({
      text: '¿Estás seguro que quieres subir esta imagen?',
      imageUrl: `${this.webcamImage}`,
      imageWidth: 400,
      imageHeight: 200,
      confirmButtonText: 'Sí',
      cancelButtonText: 'Cancelar',
      showCancelButton: true,
      cancelButtonColor: '#d33'
    }).then((result: any) => {
      if (result.isConfirmed) {
        this._modal.close({ base64: this.webcamImage, position: this.position });
      }
    });
  }

  public get triggerObservable(): Observable<void> {
    return this.trigger.asObservable();
  }

  closeModal() {
    this._modal.close();
  }

}
