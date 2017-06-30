import {
  Component,
  HostListener,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChanges,
  ViewEncapsulation
} from "@angular/core";
import * as ol from "openlayers";

@Component({
  selector: 'mc-coverage-map',
  styles: [require('./mcCoverageMap.scss'), require('openlayers/dist/ol.css')],
  template: require('./mcCoverageMap.html'),
  encapsulation: ViewEncapsulation.None
})
export class McCoverageMap implements OnInit, OnChanges, OnDestroy {
  @Input() public WKTs: Array<string>;
  @Input() public hideButton: boolean;
  @Input() public isLoading: boolean;
  private checked: boolean;
  private features: Array<ol.Feature> = [];
  private map: ol.Map;
  private view: ol.View;
  private raster: ol.layer.Tile;
  private vector: ol.layer.Vector;
  private extent: ol.Extent;
  private expanded: boolean = false;
  private minSize: string = "30%";
  private maxSize: string = "100%";
  private maxBtnText: string = "Maximize Map";
  private minBtnText = "Minimize Map";
  public btnText: string = this.maxBtnText;
  public size: string = this.minSize;

  ngOnInit(): void {
    setTimeout(() => {
      if (!this.checked) { // make sure the map is only made once
        this.raster = new ol.layer.Tile({
          source: new ol.source.OSM()
        });

        if (this.WKTs) {
          this.makeFeatures();
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

        this.map = new ol.Map({pixelRatio: 1});
        this.map.addLayer(this.raster);
        this.map.addLayer(this.vector);
        this.map.setView(this.view);
        this.map.setTarget('map');
        this.checked = true;
        this.extent = this.vector.getSource().getExtent();
        if (this.WKTs) {
          this.fitMap();
        }
      }
    }, 200);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (this.checked) {
      for(let propName in changes) {
        if (propName === 'WKTs' && this.WKTs !== null) {
          this.makeFeatures();
          this.map.render();
          this.fitMap();
        }
      }
    }
  }

  ngOnDestroy(): void {
    this.map = null; // make sure the map is actually destroyed
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
    setTimeout(() => {
      this.fitMap();
    }, 50);
  }

  private fitMap(): void {
    this.map.updateSize();
    this.map.getView().fit(this.extent, this.map.getSize());
    this.raster.getSource().refresh();
  }

  private makeFeatures(): void {
    let format = new ol.format.WKT();
    this.WKTs.forEach(WKT => {
      this.features.push(format.readFeature(WKT, {
        dataProjection: 'EPSG:4326',
        featureProjection: 'EPSG:3857'
      }));
    });
  }

  @HostListener("window:resize", [])
  public onResize(): void {
    this.fitMap();
  }
}
