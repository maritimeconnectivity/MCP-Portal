import {Component, Input, ViewEncapsulation, OnInit} from '@angular/core';
import * as ol from 'openlayers';

@Component({
  selector: 'mc-coverage-map',
  styles: ['@import "https://openlayers.org/en/latest/css/ol.css";'],
  template: require('./mcCoverageMap.html'),
  encapsulation: ViewEncapsulation.None
})
export class McCoverageMap implements OnInit {
  public WKT: string = 'POLYGON((9.0000 66.0000, 31.0000 66.0000, 31.0000 53.0000, 9.0000 53.0000, 9.0000 66.0000))';
  public map: any;

  ngOnInit(): void {
    let raster = new ol.layer.Tile({
      source: new ol.source.OSM()
    });

    let format = new ol.format.WKT();

    let feature = format.readFeature(this.WKT, {
      dataProjection: 'EPSG:4326',
      featureProjection: 'EPSG:3857'
    });

    let vector = new ol.layer.Vector({
      source: new ol.source.Vector({
        features: [feature]
      })
    });

    this.map = new ol.Map({
      layers: [raster, vector],
      target: 'map',
      view: new ol.View({
        center: [2952104.0199, -3277504.823],
        zoom: 4
      })
    });
  }
}
