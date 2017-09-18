import {Component, ViewEncapsulation} from '@angular/core';
import {Xsd} from "../../../backend-api/service-registry/autogen/model/Xsd";
import {FileHelperService} from "../../../shared/file-helper.service";
import {XsdsService} from "../../../backend-api/service-registry/services/xsds.service";
import {MCNotificationType, MCNotificationsService} from "../../../shared/mc-notifications.service";

@Component({
  selector: 'sr-how-to',
  encapsulation: ViewEncapsulation.None,
  styles: [],
  template: require('./sr-how-to.html')
})
export class SrHowToComponent {
  public xsds: Array<Xsd>;

  constructor(private notifications: MCNotificationsService, private xsdsService: XsdsService, private fileHelperService: FileHelperService) {
  }

  ngOnInit() {
		this.xsdsService.getXsds().subscribe(
			xsds => {
				this.xsds = xsds;
			},
			err => {
				this.notifications.generateNotification('Error', 'Error when trying to get the XSDs', MCNotificationType.Error, err);
			}
		)
  }

  public download(xsd:Xsd) {
	  this.fileHelperService.downloadBase64File(xsd.content, xsd.contentContentType, xsd.name);
  }
}
