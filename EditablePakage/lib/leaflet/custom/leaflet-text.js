/**
 * Created by 世莲 on 2018/5/6.
 */
L.Text = L.Path.extend({
    options: {
        stroke: true,
        weight: 1,
        fill: false,
        content:"I am lotus",
        fontfamily:"Microsoft Yahei",
        size:12,
        textAlign:'center',
    },

    initialize: function (latlng, options) {
        L.setOptions(this, options);
        this._latlng = new L.latLng(latlng);
    },
    onAdd: function () {
        this._renderer._initText(this);
        this._reset();
        this._renderer._addText(this);
/*
        this._renderer._initPath(this);
        this._reset();
        this._renderer._addPath(this);*/
    },
    onRemove: function () {
        this._renderer._removeText(this);
        //this._renderer._removePath(this);
    },
    setLatLng: function (latlng) {
        this._latlng = new L.latLng(latlng);
        this.redraw();
        return this.fire('move', {latlng: this._latlng});
    },
    getLatLng: function () {
        return this._latlng;
    },
    setStyle : function (options) {
        L.Path.prototype.setStyle.call(this, options);
        if(this._renderer)
        this._renderer._updateText();
        return this;
    },
    setContent:function(str){
        if(str) {
            this.options.content = str;
        }
        this._renderer._updateText();
    },
    toGeoJSON: function (precision) {
        return L.GeoJSON.getFeature(this, {
            type: 'Point',
            coordinates: L.GeoJSON.latLngToCoords(this.getLatLng(), precision)
        });
    },
    _project: function () {
        this._point = this._map.latLngToLayerPoint(this._latlng);
        this._updateBounds();
    },
    _updateBounds: function () {
        var r = this._txtWidth||(this.options.content.length+1)*this.options.size/2,
            r2 = this.options.size-10,
            w = this._clickTolerance(),
            p = [r + w, r2 + w];
        this._pxBounds = new L.Bounds(this._point.subtract([r/2 + w, r2 + w]), this._point.add([r/2 + w,0]));
    },
    _update: function () {
        if (this._map) {
            this._updatePath();
        }
    },
    _updatePath: function () {
        this._renderer._updateText(this);
    },
    _empty: function () {
        return this._pxBounds && !this._renderer._bounds.intersects(this._pxBounds);
    },

    // Needed by the `Canvas` renderer for interactivity
    _containsPoint: function (p) {
        if (!this._pxBounds || !this._pxBounds.contains(p)) { return false; }
        return true;
        //return p.distanceTo(this._point) <= 50 + this._clickTolerance();
    }
});
L.text = function (lnglat, options){
    return new L.Text(lnglat, options);
};
L.SVG.include({
    _initText:function(layer){
        var text = layer._text = document.createElementNS('http://www.w3.org/2000/svg', 'text');

        // @namespace Path
        // @option className: String = null
        // Custom class name set on an element. Only for SVG renderer.
        if (layer.options.className) {
            L.DomUtil.addClass(text, layer.options.className);
        }

        if (layer.options.interactive) {
            L.DomUtil.addClass(text, 'leaflet-interactive');
        }
        L.DomUtil.addClass(text, 'leaflet-marker-icon');
        this._updateText(layer);
        this._layers[L.Util.stamp(layer)] = layer;

    },
    _addText:function(layer){
        if (!this._rootGroup) { this._initContainer(); }
        this._rootGroup.appendChild(layer._text);
        layer.addInteractiveTarget(layer._text);

    },
    _updateText: function (layer) {
        var text = layer._text,
            p = layer._point,
            str = layer.options.content;
        text.innerHTML = str;
        L.DomUtil.setPosition(text,p);
        this._fillTextStroke(layer);//渲染文本
    },
    _fillTextStroke: function (layer) {
        var text = layer._text,
            options = layer.options;

        if (!text) { return; }

        if (options.stroke) {
            text.setAttribute('stroke', options.color);
            text.setAttribute('stroke-opacity', options.opacity);
            text.setAttribute('stroke-width', options.weight);
        } else {
            text.setAttribute('stroke', 'none');
        }

        if (options.fill) {
            text.setAttribute('fill', options.fillColor || options.color);
            text.setAttribute('fill-opacity', options.fillOpacity);
            text.setAttribute('fill-rule', options.fillRule || 'evenodd');
        } else {
            text.setAttribute('fill', 'none');
        }
        text.setAttribute('style','font-size:' + options.size + 'px;'+'font-family:'+options.fontfamily+",text-anchor:middle");
    },
    _removeText: function (layer) {
        L.DomUtil.remove(this._text);
        layer.removeInteractiveTarget(this._text);
        delete this._layers[L.Util.stamp(this)];
    },
});
L.Canvas.include({
    _initText:function(layer){
        this._initPath(layer);
    },
    _addText:function(layer){
        this._addPath(layer);
    },
    _updateText: function (layer) {
        if (!this._drawing || layer._empty()) { return; }
        var p = layer._point,
            str = layer.options.content,
            ctx = this._ctx;

        this._drawnLayers[layer._leaflet_id] = layer;
        this._fillTextStroke(ctx, layer);//渲染文本
        if(layer.options.fill) {
            ctx.fillText(str, p.x, p.y);
        }else {
            ctx.strokeText(str, p.x, p.y);
        }
        layer._txtWidth = ctx.measureText(str).width;//获取文字在画布上的长度
        layer._txtHeight = layer.options.size;
    },
    _fillTextStroke:function(ctx,layer){
        var options = layer.options;

        if (options.fill) {
            ctx.globalAlpha = options.fillOpacity;
            ctx.fillStyle = options.fillColor || options.color;
            ctx.fill(options.fillRule || 'evenodd');
        }

        if (options.stroke && options.weight !== 0) {
            if (ctx.setLineDash) {
                ctx.setLineDash(layer.options && layer.options._dashArray || []);
            }
            ctx.globalAlpha = options.opacity;
            //ctx.lineWidth = options.weight;
            ctx.strokeStyle = options.color;
            //ctx.lineCap = options.lineCap;
            //ctx.lineJoin = options.lineJoin;
            //ctx.stroke();//会使文本产生_pxBounds大小的边框
        }
        ctx.font = options.size + "px " + options.fontfamily;
        //ctx.font = "32px Microsoft Yahei";
        ctx.textAlign="center";
    },
    _removeText:function(layer){
        this._removePath(layer);
    }

});


