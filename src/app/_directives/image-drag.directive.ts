import { Directive, HostListener, EventEmitter, Output, HostBinding, } from '@angular/core';
import { FileHandle } from './file-handle';
import { DomSanitizer } from '@angular/platform-browser';

@Directive({
  selector: '[appImageDrag]',
})

export class ImageDragDirective {

  @Output('files') files: EventEmitter<FileHandle[]> = new EventEmitter();

  @HostBinding('style.background') public background = '#eee';

  constructor(private sanitizer: DomSanitizer) { }

  @HostListener('dragover', ['$event']) public onDragOver(evt: DragEvent) {
    evt.preventDefault();
    evt.stopPropagation();
    this.background = '#999';
  }

  @HostListener('dragleave', ['$event']) public onDragLeave(evt: DragEvent) {
    evt.preventDefault();
    evt.stopPropagation();
    this.background = '#eee';
  }

  @HostListener('drop', ['$event']) public onDrop(evt: DragEvent) {
    evt.preventDefault();
    evt.stopPropagation();
    this.background = '#eee';

    let files: FileHandle[] = [];
    for (let i = 0; i < evt.dataTransfer.files.length; i++) {
      const file = evt.dataTransfer.files[i];
      this.getBase64(file).then((base64) => {
        files.push({ file, base64 });
        if (files.length > 0) {
          this.files.emit(files);
        }
      });
    }
  }

  getBase64(file: any) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });
  }

}
