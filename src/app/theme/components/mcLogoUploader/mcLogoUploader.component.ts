import {Component, ViewChild, Input, Output, EventEmitter, ElementRef, Renderer} from '@angular/core';

@Component({
  selector: 'mc-logo-uploader',
  styles: [require('./mcLogoUploader.scss')],
  template: require('./mcLogoUploader.html')
})
export class McLogoUploader {
	@Input() logo:string;

	@Input() uploadingLogo:boolean;

	//@Input() canDelete:boolean = true;
	public canDelete:boolean = false;

  @Output() onUpload:EventEmitter<any> = new EventEmitter();

  @ViewChild('fileUpload') protected _fileUpload:ElementRef;


  constructor(private renderer:Renderer) {
  }

  public ngOnInit():void {
  }

  public onFiles():void {
    let files = this._fileUpload.nativeElement.files;

    if (files.length) {
      const file = files[0];
	    this.onUpload.emit(file);
    }
  }

  public bringFileSelector():boolean {
	  if (this.uploadingLogo) {
		  return false;
	  }
    this.renderer.invokeElementMethod(this._fileUpload.nativeElement, 'click');
    return false;
  }

  public removePicture():boolean {
    this.logo = '';
    return false;
  }

  protected _changePicture(file:File):void {
    const reader = new FileReader();
    reader.addEventListener('load', (event:Event) => {
	    this.logo = (<any> event.target).result;
    }, false);
    reader.readAsDataURL(file);
  }
}
