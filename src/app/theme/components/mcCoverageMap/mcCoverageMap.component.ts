import {Component, Input, ViewEncapsulation, OnInit} from '@angular/core';
import * as ol from 'openlayers';

@Component({
  selector: 'mc-coverage-map',
  styles: ['@import "https://openlayers.org/en/latest/css/ol.css";'],
  template: require('./mcCoverageMap.html'),
  encapsulation: ViewEncapsulation.None
})
export class McCoverageMap implements OnInit {
  @Input() public WKTs: Array<string>;
  private map: any;

  ngOnInit(): void {
    let raster = new ol.layer.Tile({
      source: new ol.source.OSM()
    });

    let format = new ol.format.WKT();

    let features = [];

    this.WKTs.forEach(WKT => {
      features.push(format.readFeature(WKT, {
        dataProjection: 'EPSG:4326',
        featureProjection: 'EPSG:3857'
      }));
    });

    let vector = new ol.layer.Vector({
      source: new ol.source.Vector({
        features: features
      })
    });

    this.map = new ol.Map({
      layers: [raster, vector],
      target: 'map',
      view: new ol.View({
        center: [0, 0],
        zoom: 2
      })
    });
  }
}
