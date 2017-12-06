import {Component, ViewEncapsulation} from '@angular/core';
import {Observable} from "rxjs/Observable";
import {LabelValueModel} from "../mcLabelValueTable/index";
import {ApiVersionService} from "../../../backend-api/shared/api-version.service";

@Component({
  selector: 'mcp-versions-view',
  encapsulation: ViewEncapsulation.None,
  template: require('./mcp-versions-view.html'),
  styles: []
})
export class McpVersionsViewComponent {
	private irVersion:string;
	private srVersion:string;
	private portalVersion = require("../../../../../package.json").version;
	public isLoading:boolean;
	public labelValues:Array<LabelValueModel>;
	constructor(private apiVersionService:ApiVersionService) {
	}

	ngOnInit() {
		this.setupVersions();
	}

	private setupVersions() {
		this.isLoading = true;
		let parallelObservables = [];

		parallelObservables.push(this.apiVersionService.getVersionOfIdentityRegistry().take(1));
		parallelObservables.push(this.apiVersionService.getVersionOfServiceRegistry().take(1));

		Observable.forkJoin(parallelObservables).subscribe(
			resultArray => {
				this.irVersion = ''+resultArray[0];
				this.srVersion = ''+resultArray[1];
				this.generateLabelValues();
				return Observable.of('');
			});
	}
	private generateLabelValues() {
		this.labelValues = [];
		this.labelValues.push({label: 'Management Portal', valueHtml: this.portalVersion});
		this.labelValues.push({label: 'Identity Registry', valueHtml: this.irVersion});
		this.labelValues.push({label: 'Service Registry', valueHtml: this.srVersion});
		this.isLoading = false;
	}
}
