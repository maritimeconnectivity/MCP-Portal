import {AfterViewInit, Component, HostListener, Input, OnInit, ViewChild, ViewEncapsulation} from "@angular/core";
import * as ol from "openlayers";

@Component({
  selector: 'mc-coverage-map',
  styles: [require('./mcCoverageMap.scss')],
  template: require('./mcCoverageMap.html'),
  encapsulation: ViewEncapsulation.None
})
export class McCoverageMap implements OnInit, AfterViewInit { // TODO: try https://github.com/quentin-ol/angular2-openlayers again
  @Input() public WKTs: Array<string>;
  @Input() public hideButton: boolean;
  @Input() public isLoading: boolean;
  @ViewChild('olMap') olMap;
  private features: Array<ol.Feature> = [];
  private extent: ol.Extent;
  private map: ol.Map;
  private view: ol.View;
  private raster: ol.layer.Tile;
  private vector: ol.layer.Vector;
  private expanded: boolean = false;
  private minSize: string = "30%";
  private maxSize: string = "100%";
  private maxBtnText: string = "Maximize Map";
  private minBtnText = "Minimize Map";
  public btnText: string = this.maxBtnText;
  public size: string = this.minSize;

  ngOnInit(): void {
    this.raster = new ol.layer.Tile({
      source: new ol.source.OSM()
    });

    let format = new ol.format.WKT();

    if (this.WKTs) {
      this.WKTs.forEach(WKT => {
        this.features.push(format.readFeature(WKT, {
          dataProjection: 'EPSG:4326',
          featureProjection: 'EPSG:3857'
        }));
      });
    }

    this.vector = new ol.layer.Vector({
      source: new ol.source.Vector({
        features: this.features
      })
    });

    this.view = new ol.View({
      center: [0, 0],
      zoom: 2
    });

    this.map = new ol.Map({
      layers: [this.raster, this.vector],
      view: this.view
    });
  }

  ngAfterViewInit(): void {
    this.map.setTarget(this.olMap.nativeElement);
    this.map.updateSize();
    console.log(this.olMap);
    this.fitMap();
  }

  public expandMap(): void {
    if (this.expanded) {
      this.size = this.minSize;
      this.btnText = this.maxBtnText;
      this.expanded = false;
    } else {
      this.size = this.maxSize;
      this.btnText = this.minBtnText;
      this.expanded = true;
    }
    this.fitMap();
  }

  private fitMap(): void {
    this.map.updateSize();
    this.map.render();
    if (!this.extent && this.features.length > 0) {
      this.extent = this.features[0].getGeometry().getExtent();
      for (let i = 1; i < this.features.length; i++) {
        ol.extent.extend(this.extent, this.features[i].getGeometry().getExtent());
      }
    }

    if (this.extent) {
      this.view.fit(this.extent);
      //this.raster.getSource().refresh();
    }
  }

  public render(): void {
    this.map.render();
  }

  @HostListener("window:resize", [])
  public onResize(): void {
    this.fitMap();
  }
}
