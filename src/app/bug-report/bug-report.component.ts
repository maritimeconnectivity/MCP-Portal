import {Component, OnInit, HostListener} from '@angular/core';
import {MCNotificationsService, MCNotificationType} from "../shared/mc-notifications.service";
import {FormGroup, FormBuilder, FormControl, Validators} from "@angular/forms";
import {Organization} from "../backend-api/identity-registry/autogen/model/Organization";
import {layoutSizes} from "../theme/theme.constants";
import {NavigationHelperService} from "../shared/navigation-helper.service";
import {UrlValidator} from "../theme/validators/url.validator";
import {McUtils} from "../shared/mc-utils";
import {
	McFormControlModel,
	McFormControlType, McFormControlModelFileUpload
} from "../theme/components/mcForm/mcFormControlModel";
import {AuthService} from "../authentication/services/auth.service";
import {BugReport} from "../backend-api/identity-registry/autogen/model/BugReport";
import {BugReportingService} from "../backend-api/identity-registry/services/bug-reporting.service";
import {FileUploadType} from "../theme/components/mcFileUploader/mcFileUploader.component";
import {BugReportAttachment} from "../backend-api/identity-registry/autogen/model/BugReportAttachment";
import {Observable} from "rxjs";

@Component({
  selector: 'bug-report',
  styles: [require('./bug-report.scss')],
  templateUrl: 'bug-report.component.html'
})

export class BugReportComponent implements OnInit {
	public class:string;
	public classWidth:string;
	private fileSizeLimit:number = 4000000;
	public files:File[];
	public fileCaption = 'Upload files (Max 4MB combined)';

	// McForm params
	public isLoading = true;
	public isRegistering = false;
	public registerTitle = "Report Bug";
	public registerForm: FormGroup;
	public formControlModels: Array<McFormControlModel>;



	private observableBatch : any = [];

  constructor(private navigationHelper: NavigationHelperService, private formBuilder: FormBuilder, private notificationService: MCNotificationsService, private authService: AuthService, private bugReportService: BugReportingService) {
  }

  ngOnInit() {
	  this.calculateClass();
	  this.generateForm();
	  this.isLoading = false;
  }

	@HostListener('window:resize')
	public onWindowResize():void {
		this.calculateClass();
	}

	private calculateClass():void {
		this.class = (this.isWindowToSmall()?'bug-report-small':'bug-report-big');
		this.classWidth = (this.isWindowToNarrow()?'':'bug-report-big-width');
	}

	private isWindowToSmall():boolean {
		return window.innerHeight < (this.authService.authState.loggedIn ? 470 : 620);
	}

	private isWindowToNarrow():boolean {
		return window.innerWidth < layoutSizes.resWidthHideSidebar;
	}

	public cancel() {
		this.navigationHelper.takeMeHome();
	}

	public report() {
		this.isRegistering = true;
		let subject = this.registerForm.value.subject;
		let description = this.registerForm.value.description;
		let bugReport:BugReport = {subject:subject, description:description};
		this.files = this.registerForm.value.files;
		if (this.files && this.files.length > 0) {
			this.observableBatch = [];
			for(let file of this.files) {
				this.setUpFile(file);
			}
			Observable.forkJoin(this.observableBatch)
				.subscribe(
					(bugReportAttachment) => {
						bugReport.attachments = bugReportAttachment;
						this.reportBug(bugReport);
					},
					(e) => {
						this.notificationService.generateNotification('Error', 'Error when trying to read uploaded files for bug report', MCNotificationType.Error);
					}
				);
		} else {
			this.reportBug(bugReport);
		}
	}



	private setUpFile(file:File) {
		let fileReader:FileReader = new FileReader();
		var myobservable = Observable.create((observer: any) => {
			fileReader.onload = function (e: any) {
				let data = btoa(fileReader.result);
				let bugReportAttachment:BugReportAttachment = {data:data,mimetype:file.type,name:file.name};

				observer.next(bugReportAttachment);
				observer.complete();
			};
		});

		this.observableBatch.push(myobservable);
		fileReader.readAsBinaryString(file);
	}


	private generateAttachments(files: File[]):BugReportAttachment[] {
  	let bugReportAttachments:BugReportAttachment[] = [];

  	for(let file of files) {
		  let fileReader:FileReader = new FileReader();
		  fileReader.onload = (fileRef) => {
			  let data = btoa(fileReader.result);
			  let bugReportAttachment:BugReportAttachment = {data:data,mimetype:file.type,name:file.name};
			  bugReportAttachments.push(bugReportAttachment);
		  }
		  fileReader.readAsBinaryString(file);
	  };

  	return bugReportAttachments;
	}

	private reportBug(bugReport:BugReport) {

  	if (this.files && this.doesSizeOfFilesExceedsLimit()) {
		  let fileString = (this.files.length == 1 ? 'File is too large to upload' : 'The combined size of the Files are too large to upload');
		  this.notificationService.generateNotification('Error', fileString, MCNotificationType.Error);
		  this.isRegistering = false;
  		return;
	  }

		if (!this.authService.authState.loggedIn) {
  		this.addUserInfo(bugReport);
		}

		this.bugReportService.reportBug(bugReport).subscribe(
			organization => {
				this.notificationService.generateNotification('Bug Reporting', 'You have successfully reported a bug.', MCNotificationType.Success);
				this.navigationHelper.takeMeHome();
			},
			err => {
				this.isRegistering = false;
				if (err.status == 413) {
					let fileString = (this.files.length == 1 ? 'File is too large to upload' : 'The combined size of the Files are too large to upload');
					this.notificationService.generateNotification('Error', fileString, MCNotificationType.Error);
				} else {
					this.notificationService.generateNotification('Error', 'Error when trying to report a bug', MCNotificationType.Error);
				}
			}
		);
	}

	private addUserInfo(bugReport:BugReport) {
		let name = this.registerForm.value.name;
		let email  = this.registerForm.value.emails.email;

		let userString =
			"USER INFO: \n" +
			"Name: " + name + "\n" +
			"Email: " + email + "\n\n" +
			"BUG REPORT MESSAGE: \n";

		bugReport.description = userString + bugReport.description;
	}

	private doesSizeOfFilesExceedsLimit():boolean {
  	let combinedSize = 0;
  	for(let file of this.files) {
  		combinedSize += file.size;
	  }
  	return combinedSize > this.fileSizeLimit;
	}


	private generateForm() {
		this.registerForm = this.formBuilder.group({});
		this.formControlModels = [];

		let formControlModel:McFormControlModel = {formGroup: this.registerForm, elementId: 'subject', controlType: McFormControlType.Text, labelName: 'Subject', placeholder: 'Subject is required', validator:Validators.required};
		let formControl = new FormControl('', formControlModel.validator);
		this.registerForm.addControl(formControlModel.elementId, formControl);
		this.formControlModels.push(formControlModel);

		formControlModel = {formGroup: this.registerForm, elementId: 'description', controlType: McFormControlType.TextArea, labelName: 'Description', placeholder: 'Description is required', validator:Validators.required};
		formControl = new FormControl('', formControlModel.validator);
		this.registerForm.addControl(formControlModel.elementId, formControl);
		this.formControlModels.push(formControlModel);

		if (this.authService.authState.loggedIn) {
			let formControlModelFile:McFormControlModelFileUpload = {formGroup: this.registerForm, elementId: 'files', controlType: McFormControlType.FileUpload, labelName: this.fileCaption, placeholder: '', fileAccept:'', multipleFiles:true};
			let formControlFile = new FormControl('', formControlModelFile.validator);
			this.registerForm.addControl(formControlModelFile.elementId, formControlFile);
			this.formControlModels.push(formControlModelFile);
		} else {
			formControlModel = {formGroup: this.registerForm, elementId: 'name', controlType: McFormControlType.Text, labelName: 'Name', placeholder: 'Name is required', validator:Validators.required};
			formControl = new FormControl('', formControlModel.validator);
			this.registerForm.addControl(formControlModel.elementId, formControl);
			this.formControlModels.push(formControlModel);

			var email = '';
			if (this.authService.authState.loggedIn) {
				email = this.authService.authState.user.email;
			}
			McUtils.generateEmailConfirmGroup(this.formBuilder, this.registerForm, this.formControlModels, email);
		}
	}
}
