/**
 * Created by 世莲 on 2018/4/25.
 */
L.Arc = L.Circle.extend({
    options: {
        fill: false,
        /*radius: 10,*/
        startAngle:0,
        stopAngle:180
    },

    initialize: function (latlng, options) {
        L.setOptions(this, options);
        this._latlng = new L.latLng(latlng);
        if (isNaN(this.options.radius)) { throw new Error('Circle radius cannot be NaN'); }

        // @section
        // @aka Circle options
        // @option radius: Number; Radius of the circle, in meters.
        this._mRadius = this.options.radius;
        /*this._startAngle = this.options.startAngle;
        this._stopAngle = this.options.stopAngle;*/
    },
    getStartAngle: function() {
        return this.options.startAngle;
    },
    /*setRadius: function (radius) {
        this._mRadius = radius;
        return this.redraw();
    },*/
    setStartAngle: function(startangle) {
        this.options.startAngle = startangle;
        return this.redraw();
    },

    getStopAngle: function() {
        return this.options.stopAngle;
    },

    setStopAngle: function(stopAngle) {
        this.options.stopAngle = stopAngle;
        return this.redraw();
    },
    _project: function () {
        var lng = this._latlng.lng,
            lat = this._latlng.lat,
            map = this._map,
            crs = map.options.crs;

        if (crs.distance === L.CRS.Earth.distance) {
            var d = Math.PI / 180,
                latR = (this._mRadius / L.CRS.Earth.R) / d,
                top = map.project([lat + latR, lng]),
                bottom = map.project([lat - latR, lng]),
                p = top.add(bottom).divideBy(2),
                lat2 = map.unproject(p).lat,
                lngR = Math.acos((Math.cos(latR * d) - Math.sin(lat * d) * Math.sin(lat2 * d)) /
                        (Math.cos(lat * d) * Math.cos(lat2 * d))) / d;

            if (isNaN(lngR) || lngR === 0) {
                lngR = latR / Math.cos(Math.PI / 180 * lat); // Fallback for edge case, #2425
            }

            this._point = p.subtract(map.getPixelOrigin());
            this._radius = isNaN(lngR) ? 0 : p.x - map.project([lat2, lng - lngR]).x;
            this._radiusY = p.y - top.y;

        } else {
            var latlng2 = crs.unproject(crs.project(this._latlng).subtract([this._mRadius, 0]));

            this._point = map.latLngToLayerPoint(this._latlng);
            this._radius = this._point.x - map.latLngToLayerPoint(latlng2).x;
        }

        this._updateBounds();
    },

    _updatePath: function () {
        this._renderer._updateArc(this);
    }

});
L.arc = function (latlng, options){
    return new L.Arc(latlng, options);
};
L.Canvas.include({
    _updateArc:function(layer){

        if (layer._empty()) { return; }
        var p = layer._point,
            ctx = this._ctx,
            r = layer._radius,
            s = (layer._radiusY || r) / r
        this._drawnLayers[layer._leaflet_id] = layer;
        this._layers[layer._leaflet_id] = layer;
        if (s !== 1) {
            ctx.save();
            ctx.scale(1, s);
        }
        var sAngle = (layer.options.startAngle - 90) * Math.PI/180,
            eAngle = (layer.options.stopAngle - 90) * Math.PI/180;
        ctx.beginPath();
        // ctx.moveTo(p.x, p.y);
        ctx.arc(p.x, p.y, r,sAngle, eAngle);
        //ctx.closePath();
        // ctx.stroke();
        if (s !== 1) {
            ctx.restore();
        }
        this._fillStroke(ctx, layer);
    },
});
L.SVG.include({
    _updateArc: function (layer) {
        var //path = layer._path,
            options = layer.options;

        /*var p = layer._point,
         r = Math.max(Math.round(layer._radius), 1),
         r2 = Math.max(Math.round(layer._radiusY), 1) || r,
         arc = 'a' + r + ',' + r2 + ' 0 1,0 ';

         // drawing a circle with two half-arcs
         var d = layer._empty() ? 'M0 0' :
         'M' + (p.x - r) + ',' + p.y +
         arc + (r * 2) + ',0 ' +
         arc + (-r * 2) + ',0 ';*/

        // 起点坐标
        var s = this._coordMap(layer._point.x, layer._point.y, layer._mRadius, layer.options.startAngle),
        // 结束坐标
            e = this._coordMap(layer._point.x, layer._point.y, layer._mRadius, layer.options.stopAngle),
        // 画一段到(x,y)的椭圆弧. 椭圆弧的 x, y 轴半径分别为 rx,ry. 椭圆相对于 x 轴旋转 x-axis-rotation 度. large-arc=0表明弧线小于180读, large-arc=1表示弧线大于180度. sweep=0表明弧线逆时针旋转, sweep=1表明弧线顺时间旋转.
        // svg : [A | a] (rx ry x-axis-rotation large-arc-flag sweep-flag x y)+
            d = 'M' + s.x + ',' + s.y + 'A' + layer._radius + ',' + layer._radius + ',0,' + (+(layer.options.stopAngle - layer.options.startAngle > 180)) + ',1,' + e.x + ',' + e.y;

        this._setPath(layer, d);
        this._updateStyle(layer);
    },
    /**
     * 传入相应参数返回圆形制定半径的弧度坐标
     * @param {*} x 中心点X坐标
     * @param {*} y 中心点y坐标
     * @param {*} R 圆半径
     * @param {*} a 角度
     */
    _coordMap:function (x, y, R, a) {
        var ta = (360 - a+90) * Math.PI / 180,
            tx, ty;
        tx = R * Math.cos(ta); // 角度邻边
        ty = R * Math.sin(ta); // 角度的对边
        return {
            x: x + tx,
            y: y - ty // 注意此处是“-”号，因为我们要得到的Y是相对于（0,0）而言的。
        }
    },
});
