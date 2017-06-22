import {Component, Input, ViewEncapsulation, OnInit} from '@angular/core';
import * as ol from 'openlayers';

@Component({
  selector: 'mc-coverage-map',
  styles: [require('./mcCoverageMap.scss')],
  template: require('./mcCoverageMap.html'),
  encapsulation: ViewEncapsulation.None
})
export class McCoverageMap implements OnInit {
  @Input() public WKTs: Array<string>;
  private features: Array<ol.Feature> = [];
  private extent: ol.Extent;
  private map: ol.Map;
  private view: ol.View;
  private expanded: boolean = false;
  private minSize: string = "30%";
  private maxSize: string = "100%";
  private maxBtnText: string = "Maximize Map";
  private minBtnText = "Minimize Map";
  public btnText: string = this.maxBtnText;
  public size: string = this.minSize;

  ngOnInit(): void {
    let raster = new ol.layer.Tile({
      source: new ol.source.OSM()
    });

    let format = new ol.format.WKT();

    this.WKTs.forEach(WKT => {
      this.features.push(format.readFeature(WKT, {
        dataProjection: 'EPSG:4326',
        featureProjection: 'EPSG:3857'
      }));
    });

    let vector = new ol.layer.Vector({
      source: new ol.source.Vector({
        features: this.features
      })
    });

    this.view = new ol.View();

    this.map = new ol.Map({
      layers: [raster, vector],
      target: 'map',
      view: this.view
    });
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
    if (!this.extent && this.features.length > 0) {
      this.extent = this.features[0].getGeometry().getExtent();
      for (let i = 1; i < this.features.length; i++) {
        ol.extent.extend(this.extent, this.features[i].getGeometry().getExtent());
      }
    }

    if (this.extent) {
      this.view.fit(this.extent);
    }
  }
}
